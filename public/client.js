'use strict';

$(function() {

  //var socket = io.connect();
  var socket = io.connect('http://localhost');

  socket.on('stdout', function(data) {
    $('#output').append(data + '</br>');
  });

  socket.on('stderr', function(data) {
    $('#error').append(data + '</br>');
  });

  socket.on('result', function(data) {
    $('#results').append(data + '</br>');
  });


  $('#systems').click(function() {
    $.get('/api/1.0/systems', function(data) {
      $('#results').html(JSON.stringify(data, null, 2));
    });
  });

  $('#containers').click(function() {
    $.get('/api/1.0/system/1/containers', function(data) {
      $('#results').html(JSON.stringify(data, null, 2));
    });
  });

  $('#build').click(function() {
    socket.emit('build', {systemId: 1, containerId: 1});
  });

  $('#deploy').click(function() {
    socket.emit('deploy', {systemId: 1, containerId: 1});
  });
});


/*
<script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io('http://localhost');
  socket.on('connect', function(){
    socket.on('event', function(data){});
    socket.on('disconnect', function(){});
  });
</script>

*/
