const mongoose = requris('mongoose');
const schema = mongoose.Schema;

const model = new schema({
	username:{
		type:'string',
		required:true
	},
	password:{
		type:'string',
		required:true
	}
});

module.exports = mongoose.model('admin',model);