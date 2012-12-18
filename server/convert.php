<?php

$url = "";
$callback = "";

if (preg_match('#[\w]{1,20}#', $_GET['callback'])) {
    $callback = $_GET['callback'];
}


if (
    preg_match('#^(http://distilleryimage[0-9]+\.(s3\.amazonaws|instagram)\.com/[a-z0-9\_\-]+\.(jpg|png))?$#', $_GET['url'])
    || preg_match('#^(http://distillery+\.(s3\.amazonaws|instagram)\.com/(media/\d{4}/\d{1,2}/\d{1,2}/[a-z0-9\_\-]|[a-z0-9\_\-])+\.(jpg|png))?$#', $_GET['url'])
    ) {
    $url = $_GET['url'];
}

if ($url && $callback) {
    header("Content-type: application/javascript");
    echo $callback.'({"data":"' . base64_encode(file_get_contents($url)) . '"})';
}

