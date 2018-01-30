const mongoose = require('mongoose');
const schema = mongoose.Schema;

const model = new schema({
	qnum:{
		type:'number',
	},
	stmt:{
		type:'string',
	},
	inputf:{
		type:'string'
	},
	outputf:{
		type:'string'
	},
	testoutput:{
		type:'string',
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
	},
	testcase:{
		type:'string'
	},
	cnstr:{
		type:'string'
	}
});

module.exports = mongoose.model('question',model);