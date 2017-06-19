<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

$url = 'https://stundenplan.fh-salzburg.ac.at/data/json/rooms/';

$content = file_get_contents($url);
$json = json_decode($content, true);

$rooms = [];
foreach($json['rooms'] as $r) {
  $roomNumber = preg_replace('/[^0-9]/', '', $r['__row']['roomName']);

  if($r['__row']['campus'] == '4' && $roomNumber[0] == '3') { // only third floor
    $room['id'] = $r['__row']['roomId'];
    $room['name'] = $r['__row']['roomName'];

    array_push($rooms, $room);
  }
}

// sort by id
function cmp($r1, $r2) {
  return strcmp($r1->id, $r2->id);
}
usort($rooms, 'cmp');

$marker = 0;
foreach($rooms as $r) {
  $roomMarkerMap[$r['name']] = $marker;
  $marker++;
}


echo json_encode($roomMarkerMap);
?>
