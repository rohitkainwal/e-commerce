class ApiResponse{
    constructor(statusCode,message,data){
        this.statusCode =statusCode;
        this.message = message;
        this.data = data;
    }
     send(res){
        let responseObject = {
            success:true,
            message: this.message
        };

        if(this.data){
            responseObject.data = this.data;
        }

        res.status(this.statusCode).json(responseObject);
     }
}

export default ApiResponse