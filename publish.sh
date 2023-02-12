ffmpeg -y \
-i rtmp://127.0.0.1:1935/live/master \
-c:v copy \
-c:a copy \
-f tee \
-map 0:a? \
-map 0:v? \
[hls_time=3:hls_list_size=0]./media/master.m3u8