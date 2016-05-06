var options = [
  'l - List processes created',
  'q - Exit'
];

exports.showOptions = function (){
  options.forEach(function(option){
    console.log(option);
  });
};
