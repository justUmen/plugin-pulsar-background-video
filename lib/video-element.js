'use babel';
var fs = require('fs');
let spawn = require("child_process").spawn;
const app = require('electron').remote.app;
// const { app } = require('@electron/remote');

// const youtubedl = require('youtube-dl-exec')
//package.json require : "youtube-dl-exec": "^2.0.2"
const smalltalk = require('./smalltalk');
const os = require('os'); //For os.tmpdir(), for windows support...

class VideoPlayerElement extends HTMLElement {
  constructor() {
    super(); // Always call super first in the constructor of an HTML element
    this.backgroundImage = atom.workspace.getActivePane().getElement().querySelector('.item-views');
    this.PAUSED_AUTO = 0;
    // this.clean_path_image="file:///home/umen/SyNc/Projects/HtmlWallpaper/image_created_by_thunar.jpg"
    this.attachShadow({ mode: 'open' });
  }
  
  show_video_controls(){
    document.getElementById("button_toggle_display_video").style.display="inline-block";
    document.getElementById("play_pause").style.display="inline-block";
    document.getElementById("stop").style.display="inline-block";
    document.getElementById("next_video").style.display="inline-block";
    document.getElementById("toggle_random").style.display="inline-block";
    document.getElementById("toggle_loop").style.display="inline-block";
    document.getElementById("toggle_sound").style.display="inline-block";
    document.getElementById("toggle_autopause").style.display="inline-block";
  }

  hide_video_controls(){
    document.getElementById("button_toggle_display_video").style.display="none";
    document.getElementById("play_pause").style.display="none";
    document.getElementById("stop").style.display="none";
    document.getElementById("next_video").style.display="none";
    document.getElementById("toggle_random").style.display="none";
    document.getElementById("toggle_loop").style.display="none";
    document.getElementById("toggle_sound").style.display="none";
    document.getElementById("toggle_autopause").style.display="none";
  }

/*

@@ @@@    @@@  @@@@@   @@@@@@  @@@@@@@
@@ @@@@  @@@@ @@   @@ @@       @@
@@ @@ @@@@ @@ @@@@@@@ @@   @@@ @@@@@
@@ @@  @@  @@ @@   @@ @@    @@ @@
@@ @@      @@ @@   @@  @@@@@@  @@@@@@@

*/

  toggle_auto_change_image(){
    if(button_auto_change_image.classList.contains('status-added')){
      button_auto_change_image.classList.remove('status-added');
    }
    else{
      button_auto_change_image.classList.add('status-added');
      button_random_video.classList.remove('status-added');
      button_random_video2.classList.remove('status-added');
      button_random_video_loop.classList.remove('status-added');
      button_random_video_loop2.classList.remove('status-added');
      //If no RI green, green the RI1
      DATAPATH="";
      document.querySelectorAll(".RI").forEach(function(elem){
        if(elem.classList.contains('status-added')){
          DATAPATH=elem.dataPath;
        }
        else{
          elem.classList.remove('status-added');;
        }
      });
      if(DATAPATH!=""){
        this.open_random_images(DATAPATH);
      }
      else{
        //Use current used path (simple toggle on/off, same PATH)
        this.open_random_images(
          document.getElementById('current_random_images_path').innerHTML
        );
      }
    }
  }

  set_image_position(){
    // backgroundImage=atom.workspace.getActivePane().getElement().querySelector('.item-views');

    // const activePaneElement = atom.workspace.getActivePane().getElement();
    // const backgroundImage = activePaneElement.querySelector('.item-views');
    if(atom.config.get('background-video-player.underMinimap')==false) {
      this.backgroundImage.style.backgroundPosition="top 0px right "
        +document.querySelectorAll('.adjust-absolute-height')[0].offsetWidth+"px";
    }
    else{
      this.backgroundImage.style.backgroundPosition="top 0px right 0px";
    }
  }

    //backgroundImage=atom.workspace.getActivePane().getElement().querySelector('.item-views');
    // clean_path_image="file:///home/umen/SyNc/Projects/HtmlWallpaper/image_created_by_thunar.jpg"


    default_image(file){
      // const backgroundImage = atom.workspace.getActivePane().getElement().querySelector('.item-views');
      const clean_path_image = String(file).replace(/'/g, "\\'");
      console.log("clean_path_image => "+clean_path_image);
      this.backgroundImage.style.background="";
      this.backgroundImage.style.backgroundColor="";
      this.set_image_position();
      this.backgroundImage.style.backgroundImage="url('"+clean_path_image+"?"+Math.random()+"')";
      this.backgroundImage.style.backgroundRepeat="no-repeat";
      this.backgroundImage.style.backgroundSize="cover";
    }

  open_images(files) {
    this.stop();
    if (fs.existsSync(os.tmpdir()+'/CURRENT_VIDEO')) {
      fs.unlinkSync(os.tmpdir()+'/CURRENT_VIDEO');
    }
    // backgroundImage=atom.workspace.getActivePane().getElement().querySelector('.item-views');
    this.set_image_position();
    //.replace(/#/g,"\\#") //# USED TO REFERENCE IMAGE... CANNOT ESCAPE IT ???
    console.log(files.toString());
    const clean_path_image=files.toString().replace(/'/g,"\\'");
    console.log(clean_path_image);
    fs.writeFileSync(os.tmpdir()+'/CURRENT_IMAGE',clean_path_image);
    this.backgroundImage.style.backgroundImage="url('"+clean_path_image+"')";
    this.backgroundImage.style.backgroundSize="cover";
    button_auto_change_image.classList.remove('status-added');
    document.querySelectorAll(".RI").forEach(function(elem){
      elem.classList.remove('status-added');;
    });
    button_random_video.classList.remove('status-added');
    button_random_video2.classList.remove('status-added');
    button_random_video_loop.classList.remove('status-added');
    button_random_video_loop2.classList.remove('status-added');
  }

  async open_random_images(FILE_USER_IMAGES,WAIT=0) { //Wait x ms before changing wallpaper
    console.log("FILE_USER_IMAGES = "+FILE_USER_IMAGES);
    if (fs.existsSync(os.tmpdir()+'/CURRENT_VIDEO')) {
      fs.unlinkSync(os.tmpdir()+'/CURRENT_VIDEO');
    }
    if(document.getElementById('current_random_images_path').innerHTML!=FILE_USER_IMAGES){
      //Update value
      document.getElementById('current_random_images_path').innerHTML=FILE_USER_IMAGES;
    }
    if(WAIT!=0){
      if(document.getElementById('run_change_wallpaper_only_once').innerHTML=="1"){
        console.log("exit open_random_images, WAIT only 1 time...");
        return 0; //exit open_random_images
      }
      document.getElementById('run_change_wallpaper_only_once').innerHTML="1";
      console.log("Wait "+WAIT+"ms...");
      await new Promise(resolve => setTimeout(() => resolve(true), WAIT))
        .then((result) => {
          //back to 0 after the waiting period
          document.getElementById('run_change_wallpaper_only_once').innerHTML="0";
        });
      if(!button_auto_change_image.classList.contains('status-added')){
        console.log("button_auto_change_image DOES NOT CONTAINS status-added EXIT");
        return 0;
      }
      console.log("button_auto_change_image DOES CONTAINS status-added CONTINUE");
    }
    this.stop();
    var images = [];
    console.log("open_random_images().....");
    // backgroundImage=atom.workspace.getActivePane().getElement().querySelector('.item-views');
    this.set_image_position();
    // FILE_USER_IMAGES=document.getElementById('current_random_images_path').innerHTML;
    if (fs.existsSync(FILE_USER_IMAGES)) {
      console.log("EXISTS "+FILE_USER_IMAGES);
      fs.readdir(FILE_USER_IMAGES, function (erro, folders) {
      	for (const folder of folders) {
      	  //If folder is an image, just push the image
          if(folder.indexOf(".jpeg")>-1 || folder.indexOf(".jpg")>-1 || folder.indexOf(".png")>-1){
            // console.log("Add image : "+folder);
            images.push(folder);
          }
          else{
            // console.log("Check folder : "+folder);
            if(fs.lstatSync(FILE_USER_IMAGES+folder).isDirectory()){
              fs.readdir(FILE_USER_IMAGES+folder, function (err, files) {
                for (const file of files) images.push(folder+"/"+file);
              });
            }
          }
        }
      });
      //Delay to give time for images ARRAY to be populated
      setTimeout(() => {
        // console.log("nb of images : "+images.length);
        let RnD=Math.random();
        // console.log("RnD = " + RnD);
        let RND_IMG=images[Math.floor(RnD * images.length)];
        const clean_path_image=FILE_USER_IMAGES+"/"+String(RND_IMG).replace(/'/g,"\\'");
        console.log("clean_path_image(RND) = " + clean_path_image);
        fs.writeFileSync(os.tmpdir()+'/CURRENT_IMAGE',clean_path_image);
        this.backgroundImage.style.backgroundImage="url('"+clean_path_image+"')";
        this.backgroundImage.style.backgroundSize="cover";
      }, 500);
      if(button_auto_change_image.classList.contains('status-added')){
        this.open_random_images(
          document.getElementById('current_random_images_path').innerHTML,
          atom.config.get('background-video-player.seconds_change_wallpaper')+"000"
        );
      }
    }
    else{
      console.log("NOT EXISTS "+FILE_USER_IMAGES);
      if (fs.existsSync(atom.config.get('background-video-player.RI1_path'))) {
        new Notification("Random wallpaper change", {
          body: "Use RI1_path by default "+atom.config.get('background-video-player.RI1_path')
        });
        this.open_random_images(atom.config.get('background-video-player.RI1_path'));
      }
      else{
        new Notification("Wallpaper ", {
          body: "The folder "+atom.config.get('background-video-player.RI1_path')+" does not exists..."
        });
      }
    }
  }


  next_image(){
    //this function is launch by next_video (if no VIDEO exist)
    this.open_random_images(
      document.getElementById('current_random_images_path').innerHTML
    );
  }


/*

  @@    @@ @@ @@@@@@  @@@@@@@  @@@@@@  @@@@@@@ @@      @@@@@@@ @@@    @@@
  @@    @@ @@ @@   @@ @@      @@    @@ @@      @@      @@      @@@@  @@@@
  @@    @@ @@ @@   @@ @@@@@   @@    @@ @@@@@   @@      @@@@@   @@ @@@@ @@
   @@  @@  @@ @@   @@ @@      @@    @@ @@      @@      @@      @@  @@  @@
    @@@@   @@ @@@@@@  @@@@@@@  @@@@@@  @@@@@@@ @@@@@@@ @@@@@@@ @@      @@

*/

  create_videoElement() {
    //Create custom control bar
    var custom_controls = document.createElement('div');
    let STATUS_BAR_HEIGHT=document.querySelectorAll(".footer")[0].offsetHeight;
    custom_controls.innerHTML = '<div id="custom_controls" style="z-index:999 !important;border:1px solid black;\
      position: fixed;width: 100%;bottom: '+STATUS_BAR_HEIGHT+'px !important;left: 0;background-color:#888;">\
      <div style="background-color: #888;width: 100%;height: 5px;z-index:999" class="custom_video_bar_wrap">\
      <div class="custom_video_bar" style="position: absolute;background: #444;height: 5px;transition:0.2s;">\
      </div></div></div>';
    this.shadowRoot.appendChild(custom_controls.firstChild);
    //Create <video> element
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('autoplay', true);
    // this.videoElement.setAttribute('data-yt2html5', "xxx");
    this.videoElement.classList.add('youtube-video');
    this.videoElement.setAttribute('title', "random");
    this.videoElement.setAttribute('muted','false'); //Sound by default
    //~ this.videoElement.style.minWidth = "100%";
    //~ this.videoElement.style.minHeight = "100%";
    this.videoElement.style.width = "auto";
    this.videoElement.style.height = "100%";
    
    this.videoElement.style.position = "fixed";
    this.videoElement.style.left = 0;
    this.videoElement.style.top = 0;
    this.videoElement.style.zIndex="-99";
    
    this.videoElement.id = "background-video-player";
    //~ this.shadowRoot.appendChild(this.videoElement);
    //~ this.shadowRoot.appendChild(this.videoElement);
    document.querySelector("body > atom-workspace > atom-workspace-axis").appendChild(this.videoElement);
    //REDISPLAY VIDEO CONTROLS
    this.show_video_controls();
    
    //HIDE WALLPAPER IMAGE
    document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > atom-pane-container > atom-pane > div").style.backgroundImage = null;
  }

  // stop() {
  //   console.log("stop() is triggered");
  //   window.removeEventListener('blur', this.atom_blur);
  //   window.removeEventListener('focus', this.atom_focus);
  //   //Delete the old videos from the DOM if they exist
  //   document.querySelectorAll('.video_file').forEach(e => e.remove()); //???  :-/
  //   if (document.querySelector("#background-video-player")
  //   ){
  //     document.querySelector("#background-video-player").remove();
  //   }
  //   // document.getElementById("background-video-player").remove();
  //   //Delete old custom_controls (progress bar)
  //   if(document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > \
  //     atom-pane-container > atom-pane > div > video-player-background").shadowRoot.querySelector("video-player")
  //     .shadowRoot.querySelector("#custom_controls")
  //   ){
  //     document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > \
  //     atom-pane-container > atom-pane > div > video-player-background").shadowRoot.querySelector("video-player")
  //     .shadowRoot.querySelector("#custom_controls").remove();
  //   }
  //   this.PAUSED_AUTO=0;
  //   //HIDE SOME VIDEO CONTROLS
  //   if (fs.existsSync(os.tmpdir()+'/CURRENT_VIDEO')) {
  //     fs.unlinkSync(os.tmpdir()+'/CURRENT_VIDEO');
  //   }
  //   this.hide_video_controls();
  //   button_switch_to_from_mpv.classList.remove('status-added');
  // }
  
  stop() {
    console.log("stop() is triggered");
    window.removeEventListener('blur', this.atom_blur);
    window.removeEventListener('focus', this.atom_focus);
    // Delete the old videos from the DOM if they exist
    document.querySelectorAll('.video_file').forEach(e => e.remove());
  
    // Remove the background video player if it exists
    const backgroundVideoPlayer = document.querySelector("#background-video-player");
    if (backgroundVideoPlayer) {
      backgroundVideoPlayer.remove();
    }
  
    // Delete old custom_controls (progress bar) safely
    const videoPlayerBackground = document.querySelector("video-player-background");
    if (videoPlayerBackground && videoPlayerBackground.shadowRoot) {
      const videoPlayer = videoPlayerBackground.shadowRoot.querySelector("video-player");
      if (videoPlayer && videoPlayer.shadowRoot) {
        const customControls = videoPlayer.shadowRoot.querySelector("#custom_controls");
        if (customControls) {
          customControls.remove();
        }
      }
    }
  
    // Reset this.PAUSED_AUTO flag
    this.PAUSED_AUTO = 0;
  
    // Handle file system operations
    if (fs.existsSync(os.tmpdir()+'/CURRENT_VIDEO')) {
      fs.unlinkSync(os.tmpdir()+'/CURRENT_VIDEO');
    }
  
    // Hide video controls
    this.hide_video_controls();
    button_switch_to_from_mpv.classList.remove('status-added');
  }

  autostart(file){
    this.create_videoElement();
    console.log("AUTOSTART VIDEO : "+file);
    background_video_player=document.querySelector("#background-video-player");
    background_video_player.setAttribute('src', file);
    background_video_player.loop=true;
    document.getElementById('toggle_loop').classList.remove("status-removed");
  }


/*

  @@@    @@@ @@@@@@  @@    @@
  @@@@  @@@@ @@   @@ @@    @@
  @@ @@@@ @@ @@@@@@  @@    @@
  @@  @@  @@ @@       @@  @@
  @@      @@ @@        @@@@

*/

  switch_to_mpv(){
    VIDEO=document.querySelector("#background-video-player");
    VIDEO.style.display="none";
    VIDEO.pause(); //JUST HIDE AND PAUSE
    button_switch_to_from_mpv.classList.add('status-added');
    document.getElementById('backup_RV_or_RVL_or_MANUAL').textContent
      = document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent;
    document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent = "MPV";
    fs.writeFileSync(
      os.tmpdir()+'/CURRENT_MPV_RV_or_RVL_or_MANUAL',
      document.getElementById('backup_RV_or_RVL_or_MANUAL').textContent
    );
    //First argument is position "--start"
    //umpv_modified python script will take VIDEO.currentTime and make : "--start="+VIDEO.currentTime
    MPV_PLAYER = spawn(
      app.getPath("home")+"/.atom/packages/background-video-player/scripts/umpv_modified",
      [ VIDEO.currentTime , VIDEO.src ]
    );
  }

  switch_from_mpv(){
    VIDEO=document.querySelector("#background-video-player");
    VIDEO.style.display="";
    MPV_TIMESTAMP = spawn(app.getPath("home")+"/.atom/packages/background-video-player/scripts/mpv_timestamp.sh");
    MPV_TIMESTAMP.stdout.on('data', (data) => {
      VIDEO.currentTime = data;
      document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent
        = document.getElementById('backup_RV_or_RVL_or_MANUAL').textContent;
      fs.unlinkSync(os.tmpdir()+'/CURRENT_MPV_RV_or_RVL_or_MANUAL');
      if(fs.existsSync(os.tmpdir()+'/CURRENT_AUTOPAUSE')){
        fs.unlinkSync(os.tmpdir()+'/CURRENT_AUTOPAUSE');
      }
      spawn(app.getPath("home")+"/.atom/packages/background-video-player/scripts/quit_mpv.sh");
    });
    button_switch_to_from_mpv.classList.remove('status-added');
    VIDEO.play();
  }

  switch_to_from_mpv(){
    // TODO : Add playlist options too :)
    // TODO : BACK in Atom
    VIDEO=document.querySelector("#background-video-player");
    if(VIDEO){ //VIDEO IS OR WAS SET (BY OPENING VIDEO FROM ATOM)
      if(VIDEO.style.display=="none"){
        this.switch_from_mpv();
      }
      else{
        this.switch_to_mpv();
      }
    }
    else{ //VIDEO WAS NEVER SET : VIDEO WAS OPENED IN OS IN MPV? - NEED TO CREATE VIDEO ELEMENT
      // switch_from_mpv()
      //A little different...
      MPV_TIMESTAMP = spawn(
        app.getPath("home") + "/.atom/packages/background-video-player/scripts/mpv_timestamp.sh"
      );
      MPV_TIMESTAMP.stdout.on('data', (data) => {
        MPV_FILE_PATH = spawn(
          app.getPath("home")+"/.atom/packages/background-video-player/scripts/get_file_path.sh"
        );
        MPV_FILE_PATH.stdout.on('data', (data) => {
          this.open([ data ]);
          VIDEO=document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > \
            atom-pane-container > atom-pane > div > video-player-background")
            .shadowRoot.querySelector("video-player").shadowRoot.querySelector("#background-video-player");
          MPV_TIMESTAMP = spawn(
            app.getPath("home")+"/.atom/packages/background-video-player/scripts/mpv_timestamp.sh"
          );
          MPV_TIMESTAMP.stdout.on('data', (data) => {
            VIDEO.currentTime = data;
            spawn(app.getPath("home")+"/.atom/packages/background-video-player/scripts/quit_mpv.sh");
          });
        });
      });
      MPV_TIMESTAMP.stderr.on('data', (data) => {
        new Notification("No MPV open", { body: "Or you do not use /tmp/mpvsocket" });
      });
    }
  }

/*

  @@@@@@@  @@@@@@   @@@@@@ @@    @@ @@@@@@@
  @@      @@    @@ @@      @@    @@ @@
  @@@@@   @@    @@ @@      @@    @@ @@@@@@@
  @@      @@    @@ @@      @@    @@      @@
  @@       @@@@@@   @@@@@@  @@@@@@  @@@@@@@

*/
  atom_blur(){
    const VIDEO=document.querySelector("#background-video-player");
    if(this.PAUSED_AUTO==0 && !VIDEO.paused){
      console.log("this.PAUSED_AUTO=1;");
      this.PAUSED_AUTO=1;
      fs.writeFileSync(os.tmpdir()+'/CURRENT_TIMESTAMP',VIDEO.currentTime);
      VIDEO.pause();
    }
  }

  atom_focus(){
    const VIDEO=document.querySelector("#background-video-player");
    console.log("HAS FOCUS");
    if(this.PAUSED_AUTO==1 && VIDEO.paused){
      console.log("this.PAUSED_AUTO=0;");
      this.PAUSED_AUTO=0;
      VIDEO.play();
    }
  }

  atom_focus_blur(){
    console.log("atom_focus_blur");
    if(button_autopause.classList.contains('status-added')){
      console.log("AP is now GREEN");
      window.addEventListener('blur', this.atom_blur);
      window.addEventListener('focus', this.atom_focus);
    }
    else{
      console.log("AP is now RED");
      window.removeEventListener('blur', this.atom_blur);
      window.removeEventListener('focus', this.atom_focus);
    }
  }

/*

 @@@@@@  @@@@@@   @@@@@@   @@@@@@  @@@@@@  @@@@@@@ @@@@@@@ @@@@@@@
 @@   @@ @@   @@ @@    @@ @@       @@   @@ @@      @@      @@
 @@@@@@  @@@@@@  @@    @@ @@   @@@ @@@@@@  @@@@@   @@@@@@@ @@@@@@@
 @@      @@   @@ @@    @@ @@    @@ @@   @@ @@           @@      @@
 @@      @@   @@  @@@@@@   @@@@@@  @@   @@ @@@@@@@ @@@@@@@ @@@@@@@

*/

  set_progress_bar(){
    var bar = document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > \
      atom-pane-container > atom-pane > div > video-player-background").shadowRoot.querySelector("video-player")
      .shadowRoot.querySelector(".custom_video_bar");
    var custom_controls_bar = document.querySelector("body > atom-workspace > atom-workspace-axis > \
      atom-workspace-axis > atom-pane-container > atom-pane > div > video-player-background")
      .shadowRoot.querySelector("video-player").shadowRoot.querySelector("#custom_controls");

    background_video_player.addEventListener("timeupdate", function() {
      var time = background_video_player.currentTime / background_video_player.duration;
      bar.style.width = time * 100 + "%";
    });

    custom_controls_bar.addEventListener('click', function(e){
      //console.log("e.offsetX = " + e.offsetX);
      //console.log("custom_controls_bar.offsetWidth = " + custom_controls_bar.offsetWidth);
      const newTime = e.offsetX/custom_controls_bar.offsetWidth;
      //console.log("newTime = "+newTime);
      //console.log("bar.style.width = "+bar.style.width);
      bar.style.width = `${newTime*100}%`; //0.5 => 50%
      //console.log("bar.style.width = "+bar.style.width);
      background_video_player.currentTime = newTime*background_video_player.duration; //Go half way
    });
  }

/*

   @@@@@@  @@@@@@  @@       @@@@@@  @@@@@@  @@@@@@@
  @@      @@    @@ @@      @@    @@ @@   @@ @@
  @@      @@    @@ @@      @@    @@ @@@@@@  @@@@@@@
  @@      @@    @@ @@      @@    @@ @@   @@      @@
   @@@@@@  @@@@@@  @@@@@@@  @@@@@@  @@   @@ @@@@@@@

*/

  set_colors_for_RV(){
    //RANDOM = GREEN
    button_random.classList.remove("status-removed");
    button_random.classList.add("status-added");
    //AUTOPAUSE = RED
    button_autopause.classList.add("status-removed");
    button_autopause.classList.remove("status-added");
    //LOOP = RED
    button_loop.classList.add("status-removed");
    button_loop.classList.remove("status-added");
    //SOUND = GREEN
    button_sound.classList.remove("status-removed");
    button_sound.classList.add("status-added");
  }

  set_colors_for_RVL(){
    //RANDOM = GREEN
    button_random.classList.remove("status-removed");
    button_random.classList.add("status-added");
    //AUTOPAUSE = GREEN
    button_autopause.classList.remove("status-removed");
    button_autopause.classList.add("status-added");
    //LOOP = GREEN
    button_loop.classList.remove("status-removed");
    button_loop.classList.add("status-added");
    //SOUND = RED
    button_sound.classList.add("status-removed");
    button_sound.classList.remove("status-added");
  }

/*

  @@    @@ @@ @@@@@@  @@@@@@@  @@@@@@  @@@@@@@
  @@    @@ @@ @@   @@ @@      @@    @@ @@
  @@    @@ @@ @@   @@ @@@@@   @@    @@ @@@@@@@
   @@  @@  @@ @@   @@ @@      @@    @@      @@
    @@@@   @@ @@@@@@  @@@@@@@  @@@@@@  @@@@@@@

*/

  open_random_videos(FILE_USER_VIDEOS, LOOP=0) { //LOOP = 1 is RVL, 0 is RV
    // button_loop.classList.add('status-added');
    // if (typeof FILE_USER_VIDEOS === 'undefined'){ //??? avoid undefined... ??? only the default ???
    //   if(LOOP){
    //     FILE_USER_VIDEOS=atom.config.get('background-video-player.RVL_path');
    //     this.set_colors_for_RVL();
    //   }
    //   else{
    //     FILE_USER_VIDEOS=atom.config.get('background-video-player.RV_path');
    //     this.set_colors_for_RV();
    //   }
    // }
    document.getElementById('current_video_folder').innerHTML=FILE_USER_VIDEOS;
    this.stop();
    this.create_videoElement();
    let background_video_player=document.querySelector("#background-video-player");

    // Do not display progress bar in RVL
    if(LOOP){ //RVL
      this.set_colors_for_RVL();
      background_video_player.muted=true;
      background_video_player.loop=true;
      this.atom_focus_blur(); //AUTOPAUSE
    }
    else{ //RV
      this.set_progress_bar();
      this.set_colors_for_RV();
      background_video_player.muted=false;
      background_video_player.loop=false;
      if(window.CHECK_FOCUS){ //REMOVE AUTOPAUSE IF EXISTS
        window.removeEventListener("blur");window.removeEventListener("focus");
      }
      window.addEventListener('blur', function(){
          fs.writeFileSync(os.tmpdir()+'/CURRENT_TIMESTAMP',background_video_player.currentTime);
      });
    }

    var videos = [];
    console.log("open_random_videos().....");
    if (fs.existsSync(FILE_USER_VIDEOS)) {
      console.log("EXISTS "+FILE_USER_VIDEOS);
      fs.readdir(FILE_USER_VIDEOS, function (erro, folders) {
        for (const folder of folders) {
          //If folder is an image, just push the image
          if(folder.indexOf(".mkv")>-1 || folder.indexOf(".mp4")>-1 || folder.indexOf(".webm")>-1){
            // console.log("Add video : "+folder);
            videos.push(folder);
          }
          else{
            // console.log("Check folder : "+folder);
            fs.readdir(FILE_USER_VIDEOS+folder, function (err, files) {
              for (const file of files) videos.push(folder+"/"+file);
            });
          }
        }
      });
      //Delay to give time for videos ARRAY to be populated
      setTimeout(function(){
        console.log("nb of videos : "+videos.length);
        let RnD=Math.random();
        console.log("RnD = " + RnD);
        let RND_VID=videos[Math.floor(RnD * videos.length)];
        const clean_path_video=FILE_USER_VIDEOS+String(RND_VID); //.replace(/'/g,"\\'")
        console.log(clean_path_video);
        //Only write /tmp/CURRENT_VIDEO FOR Browser Electron if not RV, Only RVL
        if(LOOP){
          fs.writeFileSync(os.tmpdir()+'/CURRENT_VIDEO',clean_path_video);
        }
        background_video_player.setAttribute('src', clean_path_video);
      }, 200);

      //Create addeventlistener if video is over and loop is off, trigger open_random_videos() again :)
      background_video_player.addEventListener('ended', () => {
        if(!this.videoElement.loop){
          if(LOOP) this.open_random_videos(FILE_USER_VIDEOS,1);
          else this.open_random_videos(FILE_USER_VIDEOS);
        }
      });
    }
    else{
      console.log("NOT EXISTS "+FILE_USER_VIDEOS);
    }
  }

  open(files) {
    document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent="MANUAL";

    button_auto_change_image.classList.remove('status-added');
    document.querySelectorAll(".RI").forEach(function(elem){
      elem.classList.remove('status-added');;
    });
    button_random_video.classList.remove('status-added');
    button_random_video2.classList.remove('status-added');
    button_random_video_loop.classList.remove('status-added');
    button_random_video_loop2.classList.remove('status-added');

    //RANDOM = RED, manually opened : not random...
    button_random.classList.add("status-removed");
    button_random.classList.remove("status-added");
    //AUTOPAUSE = RED
    button_autopause.classList.add("status-removed");
    button_autopause.classList.remove("status-added");
    //LOOP = RED
    button_loop.classList.add("status-removed");
    button_loop.classList.remove("status-added");
    //MUTE = GREEN
    button_sound.classList.remove("status-removed");
    button_sound.classList.add("status-added");

    let number_of_videos=files.length;

    this.stop();

    //Write video path and numbers in the DOM
    //files.forEach(file => {
    for (var i = 0; i < number_of_videos; i++) {
      console.log("file : "+files[i]);
      var fileDiv = document.createElement('div');
      fileDiv.classList.add("video_file");
      if(i==0){
        fileDiv.setAttribute("title", "next_video"); //use title to know which video is next
      }
      fileDiv.setAttribute("id", "video_number_"+i);
      fileDiv.style.cssText = 'display:none;';
      fileDiv.innerText=files[i];
      document.body.appendChild(fileDiv);
    }

    if(this.videoElement) this.videoElement.remove(); //Need to have clean code again to avoid errors
    this.create_videoElement();

    if(number_of_videos!=1){
      this.videoElement.loop=false;
      document.getElementById('toggle_loop').classList.add("status-removed");
    }
    else{
      this.videoElement.loop=true;
      document.getElementById('toggle_loop').classList.remove("status-removed");
    }

    //Set video player ??? A little hacky there... but it works :p
    //(this.videoElement not working everywhere... addevenlistener??)
    let background_video_player=document.querySelector("#background-video-player");

    //LOGS
    // console.log("background_video_player.loop = " + background_video_player.loop);
    // console.log("background_video_player.muted = " + background_video_player.muted);
    // console.log("background_video_player.paused = " + background_video_player.paused);

    if(document.querySelector('[title="next_video"]')){
      //take the next video as attribute
      background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
    }

    background_video_player.addEventListener('ended', () => { //when video is over, play next video
      // if(background_video_player.getAttribute('title')=="random"){
      if(!button_random.classList.contains("status-removed")){
        do{
          new_random_video_number=Math.floor(Math.random()* number_of_videos);
        } while(
          document.getElementById('video_number_'+new_random_video_number).getAttribute("title")=="next_video"
        );
        document.querySelector('[title="next_video"]').removeAttribute('title');
        document.getElementById('video_number_'+ new_random_video_number).setAttribute("title", "next_video");
        //take the next video as attribute
        background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
      }
      else{ // NOT RANDOM
        //Give the next_video to the next video_number_x ID
        //Check the next video number
        new_video_number=parseInt(document.querySelector('[title="next_video"]').id.replace("video_number_", ""))+1;
        if(number_of_videos>new_video_number){
          document.querySelector('[title="next_video"]').removeAttribute('title');
          document.getElementById('video_number_'+new_video_number).setAttribute("title", "next_video");
          //take the next video as attribute
          background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
        }
        else{ //Restart with the first video
          document.querySelector('[title="next_video"]').removeAttribute('title');
          document.getElementById('video_number_0').setAttribute("title", "next_video");
          //take the next video as attribute
          background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
        }
      }
    });

    fs.writeFileSync(os.tmpdir()+'/CURRENT_VIDEO',background_video_player.src.replace('file://',''));
    this.set_progress_bar();
  }

/*

  @@    @@  @@@@@@  @@    @@ @@@@@@@@ @@    @@ @@@@@@  @@@@@@@
   @@  @@  @@    @@ @@    @@    @@    @@    @@ @@   @@ @@
    @@@@   @@    @@ @@    @@    @@    @@    @@ @@@@@@  @@@@@
     @@    @@    @@ @@    @@    @@    @@    @@ @@   @@ @@
     @@     @@@@@@   @@@@@@     @@     @@@@@@  @@@@@@  @@@@@@@

*/

  youtube(URL){
    // URL="https://www.youtube.com/watch?v=jbNnsiP4Rhg";
    smalltalk.prompt('Youtube URL ? (360p)', '').then((value) => {
      URL=value;
      this.stop();
      this.create_videoElement();
      console.log("Youtube : " + URL);
      VIDEO=document.querySelector("#background-video-player");
      VIDEO.style.display="";
      // format: 'best',
      //best is not smooth with new youtube-dl limitations :/ (change user-agent no effect ?
      //- smooth same link HD on chrome)
      // 18 = 360p (with sound)
      youtubedl(URL, {
        format: '18',
        getUrl: true,
        referer: URL
      })
      .then(output => {
        console.log(output);
        VIDEO_URL=output.split('\n', 1)[0];
        VIDEO.src=VIDEO_URL;
        VIDEO.play();
      })
    })
  }

/*

  @@@    @@@ @@@@@@@ @@@    @@ @@    @@
  @@@@  @@@@ @@      @@@@   @@ @@    @@
  @@ @@@@ @@ @@@@@   @@ @@  @@ @@    @@
  @@  @@  @@ @@      @@  @@ @@ @@    @@
  @@      @@ @@@@@@@ @@   @@@@  @@@@@@

*/

  //Enable / disable text-shadow
  toggle_textshadow() {
    //new Notification("textshadow", { body: "textshadow/background was toggled" });
    // document.getElementById('toggle_textshadow').classList.remove("status-removed");
    var link = document.getElementById("CSS_text_shadow"); //Fetch the link by its ID
    if(link.href.includes("textbackground.css")){
      atom.config.set('background-video-player.css_shadow',"textshadow.css");
      link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/textshadow.css";
    }
    else{
      if(link.href.includes("textshadow.css")){
        atom.config.set('background-video-player.css_shadow',"textshadow_lite.css");
        link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/textshadow_lite.css";
      }
      else{
        if(link.href.includes("textshadow_lite.css")){
          atom.config.set('background-video-player.css_shadow',"none.css");
          link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/none.css";
        }
        else{
          if(link.href.includes("none.css")){
            atom.config.set('background-video-player.css_shadow',"textshadow_white.css");
            link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/textshadow_white.css";
          }
          else{
            if(link.href.includes("textshadow_white.css")){
              atom.config.set('background-video-player.css_shadow',"textshadow_white_lite.css");
              link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/textshadow_white_lite.css";
            }
            else{
              atom.config.set('background-video-player.css_shadow',"textbackground.css");
              link.href=atom.getConfigDirPath()+"/packages/background-video-player/switch_styles/textbackground.css";
            }
          }
        }
      }
    }
  }

  //Enable / disable loop video
  toggle_loop() {
    if(this.videoElement.loop){ //if true
      //NOT ALLOW TO DISABLE LOOP IF ONLY ONE FILE IS OPENED
      //LESS THAN 2 VIDEOS
      if(!document.getElementById('video_number_1')
        && document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent=="MANUAL"
      ){
        new Notification("Loop", { body: "You selected only 1 video, loop cannot be disabled" });
      }
      else{ //AT LEAST 2 VIDEOS (RV and RVL will always go here)
        //RVL is always a loop (duh)
        if(document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent=="RVL"){
          new Notification("Loop", { body: "RVL is always a loop..." });
        }
        else{
          this.videoElement.loop=false;
          document.getElementById('toggle_loop').classList.add("status-removed");
          document.getElementById('toggle_loop').classList.remove("status-added");
          //new Notification("Loop", { body: "loop was disabled" });
        }
      }
    }
    else{
      this.videoElement.loop=true;
      document.getElementById('toggle_loop').classList.remove("status-removed");
      document.getElementById('toggle_loop').classList.add("status-added");
      //new Notification("Loop", { body: "loop was enabled" });
    }
  }

  //Enable / disable random video
  toggle_random() {
    //Can change random only if not RV or RVL (duh)
    if(document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent=="MANUAL"){
      if(button_random.classList.contains('status-removed')){
        document.getElementById('toggle_random').classList.remove("status-removed");
        document.getElementById('toggle_random').classList.add("status-added");
        //new Notification("Loop", { body: "Ramdom was enabled" });
      }
      else{
        document.getElementById('toggle_random').classList.add("status-removed");
        document.getElementById('toggle_random').classList.remove("status-added");
        //new Notification("Loop", { body: "Random was disabled" });
      }
    }
    else{
      new Notification("Random", { body: "RV and RVL are always random..." });
    }
  }

  //Enable / disable video sound
  toggle_sound() {
    if(this.videoElement.muted){  //if true
      this.videoElement.muted=false;
      document.getElementById('toggle_sound').classList.remove("status-removed");
      document.getElementById('toggle_sound').classList.add("status-added");
      //new Notification("muted", { body: "Sound was enabled" });
    }
    else{
      this.videoElement.muted=true;
      document.getElementById('toggle_sound').classList.add("status-removed");
      document.getElementById('toggle_sound').classList.remove("status-added");
      //new Notification("muted", { body: "Sound was muted" });
    }
  }

  toggle_display_video(){
    VIDEO_PLAYER=document.querySelector("body > atom-workspace > atom-workspace-axis > atom-workspace-axis > \
      atom-pane-container > atom-pane > div > video-player-background")
    console.log('toggle_display_video');
    if(VIDEO_PLAYER.style.display=="none"){
      VIDEO_PLAYER.style.display="";
      document.getElementById('button_toggle_display_video').textContent="X";
    }
    else{
      VIDEO_PLAYER.style.display="none";
      document.getElementById('button_toggle_display_video').textContent="O";
    }
  }

  play_pause(){
    console.log('play_pause');
    if(this.videoElement.paused){
      this.videoElement.play();
      document.getElementById('play_pause').textContent="⏸";
    }
    else{
      this.videoElement.pause();
      document.getElementById('play_pause').textContent="▶";
    }
  }

  toggle_autopause(){
    if(document.getElementById('toggle_autopause').classList.contains("status-added")){ //IF GREEN
      document.getElementById('toggle_autopause').classList.add("status-removed");
      document.getElementById('toggle_autopause').classList.remove("status-added");
      if(fs.existsSync(os.tmpdir()+'/CURRENT_AUTOPAUSE')){
        fs.unlinkSync(os.tmpdir()+'/CURRENT_AUTOPAUSE');//Used by Browser_electron ???
      }
      //new Notification("autopause", { body: "Autopause is disabled" });
      // if(window.CHECK_FOCUS) clearInterval(CHECK_FOCUS);
      this.atom_focus_blur();
    }
    else{
      document.getElementById('toggle_autopause').classList.remove("status-removed");
      document.getElementById('toggle_autopause').classList.add("status-added");
      fs.writeFileSync(os.tmpdir()+'/CURRENT_AUTOPAUSE',"AP");//Used by Browser_electron ???
      //new Notification("autopause", { body: "Autopause is enabled" });
      //Pause / unpause automatically if window not focused
      this.PAUSED_AUTO=0 //I THINK NEED TO PUT HERE RIGHT ???
      this.atom_focus_blur();
    }
  }

  next_video(){
    VIDEO=document.querySelector("#background-video-player");
    if(!VIDEO){
      this.next_image();
      return 1;
    }
    if(document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent=="RVL"){
      this.open_random_videos(document.getElementById('current_video_folder').innerHTML,1);
    }
    else if(document.getElementById('RV_or_RVL_or_MANUAL_or_MPV').textContent=="RV"){
      this.open_random_videos(document.getElementById('current_video_folder').innerHTML);
    }
    else{ //MANUAL OPENING
      //Need minimum 2 videos to go next video, otherwise trigger random ? :)
      if(document.getElementById('video_number_1')){ //IT means 0 and 1 exists... :D
        if(!button_random.classList.contains("status-removed")){
          console.log("NEXT VIDEO IS RANDOM !!!!");
          do{
            new_random_video_number=Math.floor(Math.random()* number_of_videos);
          } while(
            document.getElementById('video_number_'+new_random_video_number).getAttribute("title")=="next_video"
          );
          document.querySelector('[title="next_video"]').removeAttribute('title');
          document.getElementById('video_number_'+ new_random_video_number).setAttribute("title", "next_video");
          background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
        }
        else{ // NOT RANDOM
          //Give the next_video to the next video_number_x ID
           //Check the next video number
          new_video_number=parseInt(
            document.querySelector('[title="next_video"]').id.replace("video_number_", "")
          )+1;
          if(number_of_videos>new_video_number){
            document.querySelector('[title="next_video"]').removeAttribute('title');
            document.getElementById('video_number_'+new_video_number).setAttribute("title", "next_video");
            background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
          }
          else{ //Restart with the first video
            document.querySelector('[title="next_video"]').removeAttribute('title');
            document.getElementById('video_number_0').setAttribute("title", "next_video");
            background_video_player.setAttribute('src', document.querySelector('[title="next_video"]').innerText);
          }
        }
      }
    } //END MANUAL OPENING (else)
    fs.writeFileSync(os.tmpdir()+'/CURRENT_VIDEO',background_video_player.src.replace('file://',''));
  }

};

// module.exports = customElements.define('video-player', {
//   prototype: VideoPlayerElement.prototype
// });

customElements.define('video-player', VideoPlayerElement);

// Export the class so it can be imported elsewhere
export default VideoPlayerElement;