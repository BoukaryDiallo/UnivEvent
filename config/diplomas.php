<?php

return [

    'scolarite_emails' => array_filter(explode(
        ',',
        (string) env('DIPLOMAS_SCOLARITE_EMAILS', 'admin@example.com'),
    )),

];
