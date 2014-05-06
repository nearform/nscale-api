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
    $.get('/api/list/systems', function(data) {
      $('#results').html(JSON.stringify(data, null, 2));
    });
  });

  $('#containers').click(function() {
    $.get('/api/list/containers/1', function(data) {
      $('#results').html(JSON.stringify(data, null, 2));
    });
  });

  $('#build').click(function() {
    socket.emit('build', {systemId: 1, containerId: 1});
/*


    $.get('/api/build/container/1/3', function(data) {
      $('#results').html(JSON.stringify(data, null, 2));
    });
    */
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
