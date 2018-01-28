const mongoose = require('mongoose');
const schema = mongoose.Schema;

const model = new schema({
	username:{
		type:'string',
		required:true
	},
	password:{
		type:'string',
		requried:true
	},
	score:{
		type:'number',
		default:0
	},
	submissions:{
		type:'array',
		default:[]
	},
	csubmissions:{
		type:'array'
	},
	easyi:{
		type:'number',
		default:1
	},
	medi:{
		type:'number',
		default:1
	},
	hardi:{
		type:'number',
		default:1
	}
});

module.exports = mongoose.model('user',model);