// function RRD(args){
//   var arg = JSON.stringify(args);
//   return JSON.parse(arg);
// }

// exports.RRD=RRD;
const Tools = {
    isError: function(err,res,data) {
       if(err){
          res.json({ code: -1,msg: "请稍后再试"} );
       }else{
        res.json({ code: 200,data });
       }
    }
}

module.exports = Tools;