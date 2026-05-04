let capture;
let facemesh;
let predictions = [];
const targetIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const targetIndices2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
const rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 啟用攝影機擷取影像
  capture = createCapture(VIDEO);
  capture.hide(); 
  
  // 載入 ml5 Facemesh 模型
  facemesh = ml5.facemesh(capture, () => {
    console.log("Facemesh model ready!");
  });
  facemesh.on("predict", results => {
    predictions = results;
  });

  // 設定圖片的繪製模式為中心點
  imageMode(CENTER);
}

function draw() {
  // 設定畫布背景顏色為 #e7c6ff
  background('#e7c6ff');
  
  // 將繪圖原點移動到畫布的正中心
  translate(width / 2, height / 2);
  
  // 將 X 軸縮放 -1，達成左右顛倒（鏡像）的效果
  scale(-1, 1);
  
  let imgW = width / 2;
  let imgH = height / 2;

  // 繪製攝影機影像，寬高設定為畫布寬高的 50%
  image(capture, 0, 0, imgW, imgH);

  // 繪製 Facemesh 臉部特徵點
  if (predictions.length > 0 && capture.width > 0) {
    let scaleX = imgW / capture.width;
    let scaleY = imgH / capture.height;
    
    stroke(255, 0, 0); // 線條採用紅色
    strokeWeight(1);   // 粗細為1
    
    for (let i = 0; i < predictions.length; i++) {
      let keypoints = predictions[i].scaledMesh;
      
      // 利用 line 指令將指定的編號串接在一起
      for (let j = 0; j < targetIndices.length - 1; j++) {
        let p1 = keypoints[targetIndices[j]];
        let p2 = keypoints[targetIndices[j + 1]];
        
        let x1 = p1[0] * scaleX - imgW / 2;
        let y1 = p1[1] * scaleY - imgH / 2;
        let x2 = p2[0] * scaleX - imgW / 2;
        let y2 = p2[1] * scaleY - imgH / 2;
        
        line(x1, y1, x2, y2);
      }
      
      // 連接最後一點與第一點，將輪廓完美閉合 (這是嘴唇外框)
      let pLast = keypoints[targetIndices[targetIndices.length - 1]];
      let pFirst = keypoints[targetIndices[0]];
      line(pLast[0] * scaleX - imgW / 2, pLast[1] * scaleY - imgH / 2, 
           pFirst[0] * scaleX - imgW / 2, pFirst[1] * scaleY - imgH / 2);

      // 利用 line 指令將第二組指定的編號串接在一起 (內側嘴唇)
      for (let j = 0; j < targetIndices2.length - 1; j++) {
        let p1 = keypoints[targetIndices2[j]];
        let p2 = keypoints[targetIndices2[j + 1]];
        
        let x1 = p1[0] * scaleX - imgW / 2;
        let y1 = p1[1] * scaleY - imgH / 2;
        let x2 = p2[0] * scaleX - imgW / 2;
        let y2 = p2[1] * scaleY - imgH / 2;
        
        line(x1, y1, x2, y2);
      }
      
      // 連接最後一點與第一點，將內側輪廓完美閉合
      let pLast2 = keypoints[targetIndices2[targetIndices2.length - 1]];
      let pFirst2 = keypoints[targetIndices2[0]];
      line(pLast2[0] * scaleX - imgW / 2, pLast2[1] * scaleY - imgH / 2, 
           pFirst2[0] * scaleX - imgW / 2, pFirst2[1] * scaleY - imgH / 2);

      // 利用 line 指令將右眼外圈 (編號 247) 串接在一起
      for (let j = 0; j < rightEyeOuter.length - 1; j++) {
        let p1 = keypoints[rightEyeOuter[j]];
        let p2 = keypoints[rightEyeOuter[j + 1]];
        
        let x1 = p1[0] * scaleX - imgW / 2;
        let y1 = p1[1] * scaleY - imgH / 2;
        let x2 = p2[0] * scaleX - imgW / 2;
        let y2 = p2[1] * scaleY - imgH / 2;
        
        line(x1, y1, x2, y2);
      }
      // 右眼外圈閉合
      let pLastRO = keypoints[rightEyeOuter[rightEyeOuter.length - 1]];
      let pFirstRO = keypoints[rightEyeOuter[0]];
      line(pLastRO[0] * scaleX - imgW / 2, pLastRO[1] * scaleY - imgH / 2, 
           pFirstRO[0] * scaleX - imgW / 2, pFirstRO[1] * scaleY - imgH / 2);

      // 利用 line 指令將右眼內圈 (編號 246) 串接在一起
      for (let j = 0; j < rightEyeInner.length - 1; j++) {
        let p1 = keypoints[rightEyeInner[j]];
        let p2 = keypoints[rightEyeInner[j + 1]];
        
        let x1 = p1[0] * scaleX - imgW / 2;
        let y1 = p1[1] * scaleY - imgH / 2;
        let x2 = p2[0] * scaleX - imgW / 2;
        let y2 = p2[1] * scaleY - imgH / 2;
        
        line(x1, y1, x2, y2);
      }
      // 右眼內圈閉合
      let pLastRI = keypoints[rightEyeInner[rightEyeInner.length - 1]];
      let pFirstRI = keypoints[rightEyeInner[0]];
      line(pLastRI[0] * scaleX - imgW / 2, pLastRI[1] * scaleY - imgH / 2, 
           pFirstRI[0] * scaleX - imgW / 2, pFirstRI[1] * scaleY - imgH / 2);
    }
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
