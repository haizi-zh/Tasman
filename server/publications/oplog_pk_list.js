// OplogPkList = new Mongo.Collection('OplogPkList');




// (function() {
// 	var localityName = {};
// 	var countryName = {};
// 	var i = 1;
// 	var isInLocality = true;
// 	OplogPkList.find({}).forEach(function(doc) {
// 		var pk = doc.pk;
// 		var vs = ViewSpot.findOne({'_id': new Mongo.ObjectID(pk)});
// 		if(vs && vs.targets && vs.targets.length) {
// 			vs.targets.map(function(localityId, index){
// 				if(index < 2) {
// 					var zhName = '';
// 					isInLocality = true;
// 					var temp = Locality.findOne({'_id': new Mongo.ObjectID(localityId._str)});
// 					if(!temp) {
// 						isInLocality = false;
// 						temp = Country.findOne({'_id': new Mongo.ObjectID(localityId._str)});
// 					}
// 					if(temp) {
// 						zhName = temp.zhName;
// 						if(isInLocality){
// 							localityName[zhName] = true;
// 						}else{
// 							countryName[zhName] = true;
// 						}
// 					}
// 				}
// 			});
// 		}
// 		console.log(i);
// 		i += 1;
// 	});
// 	console.log(_.keys(localityName));
// 	console.log('-------------------------');
// 	console.log(_.keys(countryName));
// }())