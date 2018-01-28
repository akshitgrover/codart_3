const mongoose = require('mongoose');
const schema = mongoose.Schema;

const model = new schema({
	stmt:{
		type:'string',
	},
	input:{
		type:'string'
	},
	output:{
		type:'string'
	},
	sinput:{
		type:'string',
	},
	soutput:{
		type:'string'
	},
	expln:{
		type:'string'
	},
	diff:{
		type:'number'
	}
});

module.exports = mongoose.model('question',model);