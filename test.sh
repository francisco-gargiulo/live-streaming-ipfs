ffmpeg -init_hw_device vaapi \
  -hwaccel vaapi \
  -f v4l2 \
  -i /dev/video0 \
  -vcodec rawvideo \
  -acodec copy \
  -f matroska \
  - | ffplay \
  -i -