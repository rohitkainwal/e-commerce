//? one place for the status colours, used by OrdersPage and OrderDetail
export const statusColor = (status) => {
  if (status === "Delivered") return "bg-primary-50 text-primary-700";
  if (status === "Cancelled") return "bg-red-100 text-brandred";
  if (status === "Shipped") return "bg-accent-soft text-accent-ink";
  return "bg-cream-200 text-primary-800";
};
