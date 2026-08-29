import expressAsyncHandler from "express-async-handler";
import paypal from "../../config/paypal.config.js";
import AddressModel from "../../models/address.model.js";
import CartModel from "../../models/cart.model.js";
import OrderModel from "../../models/order.model.js";
import ProductModel from "../../models/product.model.js";
import ApiResponse from "../../utils/ApiResponse.util.js";
import CustomError from "../../utils/CustomError.util.js";
import { checkServiceable } from "../../utils/distance.util.js";

export const createOrder = expressAsyncHandler(async (req, res, next) => {
  const userId = req.myUser._id;
  const { cartId, addressId, paymentMethod } = req.body;

  let cart = await CartModel.findById(cartId);
  if (!cart) return next(new CustomError(404, "Cart Not Found"));

  let address = await AddressModel.findById(addressId);
  if (!address) return next(new CustomError(404, "Address Not Found"));

  if (
    cart.userId.toString() !== userId.toString() ||
    address.userId.toString() !== userId.toString()
  )
    return next(
      new CustomError(403, "You are not authorized to create this order")
    );

  if (cart.items.length === 0)
    return next(new CustomError(400, "Your cart is empty"));

  //! do not take an order we cannot deliver.
  //! checked here also, frontend check alone can be skipped easily
  const serviceable = await checkServiceable({
    lat: address.lat,
    lng: address.lng,
    city: address.city,
  });

  if (!serviceable.deliverable)
    return next(
      new CustomError(
        400,
        `Sorry, we do not deliver to ${address.city} yet. Please choose another address.`
      )
    );

  let cartItems = [];
  let totalAmount = 0;

  for (let item of cart.items) {
    let product = await ProductModel.findById(item.productId);

    //? admin might have deleted the product after it went in the cart
    if (!product)
      return next(
        new CustomError(404, "One of the products is no longer available")
      );

    //! stock check, otherwise we can sell more than what we have
    if (product.stock < item.quantity)
      return next(
        new CustomError(
          400,
          `${product.name} has only ${product.stock} left in stock`
        )
      );

    cartItems.push({
      productId: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.salePrice,
      quantity: item.quantity,
    });

    totalAmount += item.quantity * product.salePrice;
  }

  totalAmount = Number(totalAmount.toFixed(2));

  let addressInfo = {
    addressId: address._id,
    addressLine: address.addressLine,
    city: address.city,
    state: address.state,
    pincode: address.pinCode,
    phone: address.phone,
    notes: address.notes || "",
  };

  if (paymentMethod === "Online") {
    //! paypal-rest-sdk is not installed right now, so this branch is off
    if (!paypal)
      return next(
        new CustomError(
          400,
          "Online payment is not available right now, please use Cash on Delivery"
        )
      );

    let payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `${process.env.BACKEND_URL || "http://localhost:9000"}/api/shop/order/capture`,
        cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => {
              return {
                name: item.name,
                sku: item.productId,
                //? sku --> stock keeping unit (unique id for product to track inventory in paypal)
                currency: "USD",
                quantity: item.quantity,
                price: item.price.toFixed(2),
              };
            }),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "Order Payment",
        },
      ],
    };

    paypal.payment.create(payment_json, async (err, resp) => {
      //! was only console logging the error before, so response was never sent on failure
      if (err) {
        console.log(err);
        return next(new CustomError(500, "Payment could not be started"));
      }

      let approvalUrl = resp.links.filter(
        (link) => link.rel == "approval_url"
      )[0].href;

      await OrderModel.create({
        userId,
        cartId,
        cartItems,
        addressInfo,
        paymentMethod,
        totalAmount,
        paymentId: resp.id,
      });

      new ApiResponse(201, "Order Created Successfully", approvalUrl).send(res);
    });
  } else {
    //~ COD
    let newOrder = await OrderModel.create({
      userId,
      cartId,
      cartItems,
      addressInfo,
      paymentMethod: "COD",
      totalAmount,
      orderStatus: "Placed",
      paymentStatus: "Pending", //? money will come at delivery time
    });

    //! reduce the stock of every product that was ordered
    for (let item of cartItems) {
      await ProductModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    //! order is placed, so the cart should become empty
    cart.items = [];
    await cart.save({ validateBeforeSave: false });

    new ApiResponse(201, "Order Placed Successfully", newOrder).send(res);
  }
});

export const captureOrder = expressAsyncHandler(async (req, res, next) => {
  if (!paypal) return next(new CustomError(400, "Online payment is off"));

  //? paypal redirects the user back with a GET, so the values come in query.
  //? keeping body also, in case we call it ourselves from the frontend
  const paymentId = req.query.paymentId || req.body.paymentId;
  const PayerID = req.query.PayerID || req.body.PayerID;

  paypal.payment.execute(
    paymentId,
    { payer_id: PayerID },
    async (err, resp) => {
      if (err) {
        console.log(err);
        return next(new CustomError(500, "Payment could not be captured"));
      }

      let order = await OrderModel.findOne({ paymentId });
      if (!order) return next(new CustomError(404, "Order Not Found"));

      if (order.paymentStatus === "Paid")
        return next(new CustomError(400, "Payment already captured"));

      if (resp.state === "approved") {
        order.paymentStatus = "Paid";
        order.orderStatus = "Placed";
        order.payerId = PayerID;
        await order.save();

        //? same as COD --> reduce stock and empty the cart
        for (let item of order.cartItems) {
          await ProductModel.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
        await CartModel.findByIdAndUpdate(order.cartId, { items: [] });

        new ApiResponse(200, "Payment Captured Successfully", resp).send(res);
      } else {
        //! "Cancelled" is not in the paymentStatus enum, so using "Failed"
        order.paymentStatus = "Failed";
        order.payerId = PayerID;
        await order.save();
        return next(
          new CustomError(
            400,
            "Payment not successful, if amount was deducted it will be refunded in 5-7 working days"
          )
        );
      }
    }
  );
});

export const getOrders = expressAsyncHandler(async (req, res, next) => {
  //? all orders of the logged in user, newest first
  const orders = await OrderModel.find({ userId: req.myUser._id }).sort({
    createdAt: -1,
  });

  new ApiResponse(200, "Orders Fetched Successfully", orders).send(res);
});

export const getOrder = expressAsyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await OrderModel.findOne({
    _id: orderId,
    userId: req.myUser._id, //! so that a user cannot open someone else's order
  });

  if (!order) return next(new CustomError(404, "Order Not Found"));

  new ApiResponse(200, "Order Fetched Successfully", order).send(res);
});

//TODO: refundOrder, returnOrder --> these need the payment gateway, will do after paypal is on
export const cancelOrder = expressAsyncHandler(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await OrderModel.findOne({
    _id: orderId,
    userId: req.myUser._id,
  });

  if (!order) return next(new CustomError(404, "Order Not Found"));

  if (order.orderStatus === "Cancelled")
    return next(new CustomError(400, "Order is already cancelled"));

  //? once it is shipped we cannot cancel, that becomes a return case
  if (["Shipped", "Delivered"].includes(order.orderStatus))
    return next(
      new CustomError(400, `Order is already ${order.orderStatus}, cannot cancel now`)
    );

  order.orderStatus = "Cancelled";
  await order.save();

  //! putting the stock back
  for (let item of order.cartItems) {
    await ProductModel.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }

  new ApiResponse(200, "Order Cancelled Successfully", order).send(res);
});

export const refundOrder = expressAsyncHandler(async (req, res, next) => {
  return next(new CustomError(501, "Refund is not implemented yet"));
});

export const returnOrder = expressAsyncHandler(async (req, res, next) => {
  return next(new CustomError(501, "Return is not implemented yet"));
});
