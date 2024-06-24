const baseUrl = '/encrypted-media/video';
const initUrl = `${baseUrl}/init.mp4`;
const templateUrl = `${baseUrl}/seg-$Number$.mp4`;

// 发送请求的工具
const sendRequest = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function (e) {
            if (xhr.status !== 200) {
                reject(xhr);
                return;
            }
            resolve(xhr.response);
        };

        xhr.send();
    });
}

// 加载片段并添加到 source buffer
const loadSegmentFactory = (sourceBuffer) => (url) => {
    return sendRequest(url).then((data) => {
        sourceBuffer.appendBuffer(new Uint8Array(data));
    });
}

// 按顺序加载片段
const loadNextSegmentFactory = (sourceBuffer) => {
    const segmentCount = 7;
    let currentIndex = 1;

    return () => {
        if (currentIndex > segmentCount) {
            return;
        }

        const url = templateUrl.replace('$Number$', currentIndex);
        loadSegmentFactory(sourceBuffer)(url).then(() => {
            currentIndex += 1;
        });
    }
}

const onMediaSourceOpen = (event) => {
    const {target: mediaSource} = event;
    const videoSourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001F"');
    const loadNextSegment = loadNextSegmentFactory(videoSourceBuffer);
    videoSourceBuffer.addEventListener('updateend', loadNextSegment); // updateend 事件表示上一个 segment 已经被成功 append 进 source buffer

    loadSegmentFactory(videoSourceBuffer)(initUrl);
}

const start = (videoElement) => {
    if (!window.MediaSource) {
        console.error('No Media Source API available');
        return;
    }

    const mediaSource = new MediaSource(); // 1. 创建 media source 实例
    mediaSource.addEventListener('sourceopen', onMediaSourceOpen); // 2. 当媒体源打开后触发
    videoElement.src = window.URL.createObjectURL(mediaSource); // 3. 把 media source 实例转换成可以被 video 使用的内存地址
}

const videoElement = document.getElementById('videoElement');
// 设置好 media keys
setMediaKeysTo(videoElement);
// 触发 encrypted 事件时获取 license
videoElement.addEventListener('encrypted', onEncrypted)

// 开始加载资源
start(videoElement);


