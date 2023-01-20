module.exports = {
	mongoURI:'mongodb+srv://dappmaster:kollol@cluster0.actqmgr.mongodb.net/brave?retryWrites=true&w=majority',
	secretOrKey: 'secret',
	paymentSuccessRedirecURL: "http://localhost:3000/payment-success",
	paymentFailedRedirecURL: "http://localhost:3000/payment-failed"
}
