const audio = document.getElementById('audio');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const currentEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const progressFilled = document.getElementById('progress-filled');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const volumeEl = document.getElementById('volume');
const autoplayEl = document.getElementById('autoplay');
const playlistEl = document.getElementById('playlist');

audio.autoplay = false;
autoplayEl.checked = false;

audio.loop = false;

// Prevent default touch behaviors for buttons
document.querySelectorAll('button, .track').forEach(el => {
    el.addEventListener('touchstart', () => el.classList.add('touch-active'), false);
    el.addEventListener('touchend', () => el.classList.remove('touch-active'), false);
});

// Playlist using the songs actually present in the Music Player folder
const tracks = [
	{title:'Bairan (Radha Krishna Version)', artist:'SouthMelody', src:'Bairan song (Radha Krishna Version) - SouthMelody.mp3', cover:'Bairan.jpg', coverFallback:'https://picsum.photos/seed/baira/300/300', theme:{bg1:'#17102f', bg2:'#09132f', accent:'#ff5f7f', accent2:'#705cff'}},
	{title:'Jo Tere Sang', artist:'Blood Money', src:'ytmp3free.cc_jo-tere-sang-blood-money-kunal-khemu-amrita-puri-mustafa-zahid-jeet-gannguli-4k-youtubemp3free.org.mp3', cover:'JoTereSang.jpg', coverFallback:'https://picsum.photos/seed/tera/300/300', theme:{bg1:'#081321', bg2:'#161025', accent:'#3dd7d7', accent2:'#9b6cff'}}
];

let currentIndex = 0;
let isPlaying = false;

const defaultCover = 'https://via.placeholder.com/300/7c5cff/ffffff?text=Cover';

function loadTrack(index){
	const t = tracks[index];
	audio.src = encodeURI(t.src);
	audio.load();
	titleEl.textContent = t.title;
	artistEl.textContent = t.artist || '';
	coverEl.onerror = () => {
		coverEl.onerror = null;
		coverEl.src = t.coverFallback || defaultCover;
	};
	coverEl.src = t.cover || t.coverFallback || defaultCover;
	updateThemeForTrack(t.theme || {});
	updateBackgroundImage(t.cover || t.coverFallback || '');
	progressFilled.style.width = '0%';
	currentEl.textContent = '0:00';
	durationEl.textContent = '0:00';
	highlightPlaylist();
}

function updateThemeForTrack(theme){
	document.documentElement.style.setProperty('--bg1', theme.bg1 || '#071126');
	document.documentElement.style.setProperty('--bg2', theme.bg2 || '#021020');
	document.documentElement.style.setProperty('--accent', theme.accent || '#ff6b6b');
	document.documentElement.style.setProperty('--accent2', theme.accent2 || '#7c5cff');
}

function updateBackgroundImage(url){
	if(url){
		document.documentElement.style.setProperty('--bg-image', `url("${encodeURI(url)}")`);
	}else{
		document.documentElement.style.setProperty('--bg-image', 'none');
	}
}

function play(){
	document.body.classList.add('playing');
	audio.play().catch((error)=>{
		console.warn('Audio play failed', error);
		titleEl.textContent = 'Unable to play track';
		artistEl.textContent = 'Check file path or browser audio permissions';
	});
	isPlaying = true;
	playBtn.textContent = '⏸';
}

function pause(){
	audio.pause();
	document.body.classList.remove('playing');
	isPlaying = false;
	playBtn.textContent = '▶';
}

playBtn.addEventListener('click', ()=>{
	if(!audio.src) loadTrack(currentIndex);
	if(isPlaying) pause(); else play();
});
prevBtn.addEventListener('click', ()=>{ prevTrack(); });
nextBtn.addEventListener('click', ()=>{ nextTrack(); });

function prevTrack(){
	currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
	loadTrack(currentIndex);
	play();
}

function nextTrack(){
	currentIndex = (currentIndex + 1) % tracks.length;
	loadTrack(currentIndex);
	play();
}

audio.addEventListener('timeupdate', ()=>{
	if(audio.duration){
		const pct = (audio.currentTime / audio.duration) * 100;
		progressFilled.style.width = pct + '%';
		currentEl.textContent = formatTime(audio.currentTime);
		durationEl.textContent = formatTime(audio.duration);
	}
});

// Handle both click and touch events for progress bar
function seekTo(e){
	const rect = progress.getBoundingClientRect();
	const clientX = e.touches ? e.touches[0].clientX : e.clientX;
	const x = clientX - rect.left;
	const pct = Math.max(0, Math.min(1, x / rect.width));
	if(audio.duration) audio.currentTime = pct * audio.duration;
}

progress.addEventListener('click', seekTo);
progress.addEventListener('touchend', seekTo);

volumeEl.addEventListener('input', (e)=>{ audio.volume = e.target.value; });

audio.addEventListener('error', ()=>{
	titleEl.textContent = 'Track failed to load';
	artistEl.textContent = 'Make sure the MP3 file exists in the Music Player folder';
	isPlaying = false;
	playBtn.textContent = '▶';
});

audio.addEventListener('ended', ()=>{
	if(autoplayEl.checked) nextTrack(); else pause();
});

function formatTime(sec){
	if(!sec || isNaN(sec)) return '0:00';
	const m = Math.floor(sec/60);
	const s = Math.floor(sec%60).toString().padStart(2,'0');
	return `${m}:${s}`;
}

function renderPlaylist(){
	playlistEl.innerHTML = '';
	tracks.forEach((t, i)=>{
		const div = document.createElement('div');
		div.className = 'track';
		div.dataset.index = i;
		div.innerHTML = `<div class="meta-left"><div class="t-info"><span class="t-title">${t.title}</span><span class="t-artist">${t.artist||''}</span></div></div><div class="t-duration"></div>`;
		div.addEventListener('click', ()=>{ currentIndex = i; loadTrack(i); play(); });
		playlistEl.appendChild(div);
	});
	highlightPlaylist();
}

function highlightPlaylist(){
	const items = playlistEl.querySelectorAll('.track');
	items.forEach(it=>{ it.classList.toggle('active', Number(it.dataset.index)===currentIndex); });
}

renderPlaylist();
loadTrack(currentIndex);