# Video streaming on IPFS

Local setup for HTTP live transmissions on IPFS

## Overview

    +--------------+               +---------------+             +------------+
    |  OBS Studio  | --(stream)--> |  RTMP Server  | <--(pull)-- | Uploader   |
    +--------------+               |  ↳ nginx      |             | ↳ node.js  |
                                   +---------------+             | ↳ ffmpeg   |
                                                                 +------------+
                                                                       |
                                                                    (upload)
                                                                       V
                                                                  +----------+
                                                                  |   IPFS   |
                                                                  +----------+

## Install

### FFMPEG

Update packages

    $ sudo apt update

Install FFMPEG

    $ sudo apt install ffmpeg

### Go-IPFS

Install Go-IPFS

    $ npm install -g ipfs

### RTMP Server

Update packages

    $ sudo apt-get update
    $ sudo apt-get upgrade

Install NGINX

    $ sudo apt-get install nginx -y

Install RTMP module

    $ sudo apt-get install libnginx-mod-rtmp -y

Edit nginx.conf

    $ sudo nano /etc/nginx/nginx.conf

Example of _nginx.conf_

    rtmp {
        server {
            listen 1935;
            application live {
                live on;
            }
        }
    }

Restart NGINX

    $ sudo systemctl restart nginx

## Usage

### Stream to IPFS Server

Push stream to:

- rtmp://127.0.0.1:1935/live/

API Key:

- index

Pull the stream from RTMP Server

    $ sh ./pull-stream

### Upload to IPFS

    $ ipfs daemon

Create a directory

    $ ipfs files mkdir /media
    $ ipfs files stat /media

Run uploader script

    $ node index.js
