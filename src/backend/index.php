<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type');

$url = 'https://stundenplan.fh-salzburg.ac.at/data/json/activities/today';

$content = file_get_contents($url);
$json = json_decode($content, true);

$roomMarkerMapJSON = file_get_contents('room_marker_map.json');
$roomMarkerMap = json_decode($roomMarkerMapJSON, true);

$markerObject['room'] = null;
$markerObject['activities'] = [];
foreach($roomMarkerMap as $room => $marker) {
  $activities[$marker] = $markerObject;
  $activities[$marker]['room'] = $room;
}

foreach($json['activities'] as $a) {
  $roomNumber = preg_replace('/[^0-9]/', '', $a['__row']['roomName']);

  if($a['__row']['campus'] == '4' && $roomNumber[0] == '3') { // only third floor
    $marker = $roomMarkerMap[$a['__row']['roomName']];

    $activity['begin'] = $a['__row']['activityBegin'];
    $activity['end'] = $a['__row']['activityEnd'];
    $activity['name'] = $a['__row']['activityName'];
    $activity['lecturer'] = str_replace('*', '', $a['__row']['lecturerName']);
    $activity['room'] = $a['__row']['roomName'];
    $activity['faculty'] = $a['__row']['facultyName'];
    $activity['campus'] = (int)$a['__row']['campus'];
    $activity['marker'] = $marker;

    array_push($activities[$marker]['activities'], $activity);
  }
}

echo json_encode((object)$activities);

?>
