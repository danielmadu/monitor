var Cli = module.exports,
    fork = require('child_process').fork,
    minimist = require('minimist'),
    colors = require('colors'),
    fs = require('fs'),
    path = require('path'),
    keyboard = require('./keyboard.js'),
    Table = require('cli-table'),
    help = require('./help');


Cli.run = function(processArgv) {
  try {
    var argv = minimist(process.argv.slice(2));
    var fork_db = [];

    process.on('exit',function(){
      console.log('»Tchau Querida!'.red.bold);
      fs.unlink('./tempFile');
    });

    if(argv._[0].length > 0){
      console.log('Digite \'q\' e pressione \'Enter\' para sair.'.yellow.bold);

      Cli.wrap(argv._[0]);

      // var child = fork('./tempFile');
      var numCPUs = require("os").cpus().length;


      for (var i = 0; i < numCPUs; i++) {
        var child = fork('./tempFile');
        child.uptime = 0;
        fork_db.push(child);
      }

      fork_db.forEach(function(value){

        value.on('message',function(data){
          value.uptime = data.uptime;
        });

        value.on('exit', function(){
          console.log('\x1b[35mTchau [Encerrado] '+value.pid);
        });

        value.on('close', function(){
          console.log('\x1b[35mTchau [Fechado] '+value.pid);
        });

        value.on('disconnect', function(){
          console.log('\x1b[35mTchau [Desconectado] '+value.pid);
          fork_db.push(fork('./tempFile'));
        });

        value.on('error', function(){
          console.log('\x1b[35mTchau [Erro] '+value.pid);
        });
      });

      keyboard.onReadable(function(data){
        switch (data) {
          case 'q':
            fork_db.forEach(function(value){
              console.log('Encerrando o PID: '+value.pid);
              value.kill();
            });
            process.exit();
            break;
          case 'l':
            var table = new Table({
                head: ['PID'.blue.bold, 'Uptime'.green.bold],
                colWidths: [15, 15],
                style : {'padding-left' : 1}
            });
            fork_db.forEach(function(value){
              table.push(
                  [value.pid, value.uptime]
              );
            });

            console.log(table.toString());
            break;
          default:
            help.showOptions();

        }
      });

    }
  } catch (err) {
    throw new Error(err);
  }
};

Cli.getSource = function(name) {
  var filename = path.resolve(__dirname,name);
  var source = fs.readFileSync(filename, 'utf-8');
  return source;
};



Cli.wrap = function(script) {
  var start = 'setInterval(function(){\n'+
    'process.send({\n'+
      'uptime: process.uptime(),\n'+
      'memory: process.memoryUsage(),\n'+
      'pid: process.pid\n'+
    '});\n'+
  '},1000);\n';

  var end = '';
  var source = Cli.getSource(script);
  var wrapped =  start + source + end;
  fs.writeFile('./tempFile', wrapped, function(err){
    if(err) console.error(err);
  });
};
