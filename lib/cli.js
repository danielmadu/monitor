'use strict'

var Cli = module.exports,
    fork = require('child_process').fork,
    minimist = require('minimist'),
    colors = require('colors'),
    fs = require('fs'),
    path = require('path');


Cli.run = (processArgv) => {
  try {
    const argv = minimist(process.argv.slice(2));
    process.on('exit',function(){
      console.log('»Tchau Querida!'.red.bold);
      fs.unlink('./tempFile');
    });

    if(argv._[0].length > 0){
      console.log('Digite \'q\' e pressione \'Enter\' para sair.'.yellow);

      Cli.wrap(argv._[0]);
      let fork_db = [];
      // let child = fork('./tempFile');
      const numCPUs = require("os").cpus().length;


      for (var i = 0; i < numCPUs; i++) {
        fork_db.push(fork('./tempFile'));
      }

      // console.log(Object.keys(fork_db));

      fork_db.forEach(function(value){
        // console.log(value.pid);

        value.on('message',function(data){
          console.log(data);
        });

        value.on('exit', function(){
          console.log('\x1b[35mTchau [Encerrado] '+value.pid);
        });

        value.on('close', function(){
          console.log('\x1b[35mTchau [Fechado] '+value.pid);
        });

        value.on('disconnect', function(){
          console.log('\x1b[35mTchau [Desconectado] '+value.pid);
        });

        value.on('error', function(){
          console.log('\x1b[35mTchau [Erro] '+value.pid);
        });
      });

    }
  } catch (err) {
    throw new Error(err);
  }
};

Cli.getSource = (name) => {
  const filename = path.resolve(__dirname,name);
  var source = fs.readFileSync(filename, 'utf-8');
  return source;
};



Cli.wrap = (script) => {
  const start = 'console.log(\'\x1b[47m\x1B[34mEiiita!!!\x1b[0m\');\n'+
  'setInterval(function(){\n'+
    'process.send({\n'+
      'uptime: process.uptime(),\n'+
      'memory: process.memoryUsage(),\n'+
      'pid: process.pid\n'+
    '});\n'+
  '},5000);\n';

  const end = '\n';
  const source = Cli.getSource(script);
  const wrapped =  start + source + end;
  fs.writeFile('./tempFile', wrapped, function(err){
    if(err) console.error(err);
  });
};
