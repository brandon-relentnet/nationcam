import VideoPlayer from '@/components/videos/VideoPlayer';

export default function Locations() {
    const videoJsOptions = {
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                src: 'https://vjs.zencdn.net/v/oceans.mp4', // Example video source
                type: 'video/mp4',
            },
        ],
    };

    return (
        <div>
            <h1>Videos</h1>
            <VideoPlayer options={videoJsOptions} />
        </div>
    );
}
