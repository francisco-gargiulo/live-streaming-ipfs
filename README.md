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

    sudo apt update

Install FFMPEG

    sudo apt install ffmpeg

Install v4l2

    sudo apt install v4l-utils

### Go-IPFS

Install Go-IPFS

    wget https://dist.ipfs.io/go-ipfs/v0.12.2/go-ipfs_v0.12.2_linux-amd64.tar.gz
    tar -xvzf go-ipfs_v0.12.2_linux-amd64.tar.gz
    sudo bash install.sh

> You can replace it with streaming directly from source to hls

### RTMP Server

Update packages

    sudo apt-get update
    sudo apt-get upgrade

Install NGINX

    sudo apt-get install nginx -y

Install RTMP module

    sudo apt-get install libnginx-mod-rtmp -y

Edit nginx.conf

    sudo nano /etc/nginx/nginx.conf

Example of _nginx.conf_

    rtmp {
        server {
            listen 1935;
            application live {
                live on;
                hls on;
                hls_path /tmp/hls;
            }
        }
    }

Restart NGINX

    sudo systemctl restart nginx

## Usage

### Stream to IPFS Server

#### RTMP

Push stream to:

- rtmp://127.0.0.1:1935/live/

API Key:

- index

Pull the stream from RTMP Server

    ffmpeg -y \
        -i rtmp://127.0.0.1:1935/live/master \
        -c:v copy \
        -c:a copy \
        -f tee \
        -map 0:a? \
        -map 0:v? \
        [hls_time=3:hls_list_size=0]./media/master.m3u8

#### FFMPEG

List devices

    v4l2-ctl --list-devices

List input formats

    ffmpeg -hide_banner -f video4linux2 -list_formats all -i /dev/video0

Test source

    ffplay -f v4l2 /dev/video0

Test hardware acceleration

    ffmpeg -init_hw_device vaapi -hwaccel vaapi -hwaccel_output_format vaapi -f v4l2 -i /dev/video0 -vcodec rawvideo -acodec copy -f matroska - | ffplay -i -

Transcode to HLS with hardware acceleration

    ffmpeg -y \
        -vaapi_device /dev/dri/renderD128 \
        -f v4l2 \
        -video_size 1920x1080 \
        -i /dev/video0 \
        -vf 'format=nv12,hwupload' \
        -c:v h264_vaapi \
        -c:a copy \
        -f tee \
        -map 0:a? \
        -map 0:v? \
        copy -f matroska - | ffplay -i -

Test stream

    ffplay hls+file:///home/anonymous/live-streaming-ipfs/media/master.m3u8

### Upload to IPFS

    ipfs daemon

Create a directory

    ipfs files mkdir /media
    ipfs files stat /media

Run uploader script

    node index.js

### Extra

Install FLV video player

    sudo apt-get install vlc browser-plugin-vlc

## References

- <https://trac.ffmpeg.org/wiki/Hardware/VAAPI>
- <http://underpop.online.fr/f/ffmpeg/help/video4linux2_002c-v4l2.htm.gz>
