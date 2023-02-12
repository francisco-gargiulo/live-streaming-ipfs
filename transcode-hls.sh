#     -loglevel debug \
#
# TODO
#
# - Try this -> -vf "scale=1280:-1,format=yuv420p" \

ffmpeg -y \
    -vaapi_device /dev/dri/renderD128 \
    -f v4l2 \
    -video_size 1920x1080 \
    -i /dev/video0 \
    -vf 'format=nv12,hwupload' \
    -c:v h264_vaapi \
    -c:a copy \
    -f tee \
    [hls_time=3:hls_list_size=0]./tmp/master.m3u8
