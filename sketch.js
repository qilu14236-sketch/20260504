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
  
  // 載入 ml5 Facemesh 模型 (對應 ml5.js v1 API)
  facemesh = ml5.faceMesh({ maxFaces: 1 }, () => {
    console.log("Facemesh model ready!");
    
    // 開始偵測臉部，並將結果即時存入 predictions
    facemesh.detectStart(capture, results => {
      predictions = results;
    });
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
      let keypoints = predictions[i].keypoints;
      
      // 定義一個輔助函式來處理串接與閉合，節省重複程式碼
      let drawFeature = (indices) => {
        for (let j = 0; j < indices.length - 1; j++) {
          let p1 = keypoints[indices[j]];
          let p2 = keypoints[indices[j + 1]];
          
          // ml5.js v1 版改用 .x 與 .y 來取得座標
          let x1 = p1.x * scaleX - imgW / 2;
          let y1 = p1.y * scaleY - imgH / 2;
          let x2 = p2.x * scaleX - imgW / 2;
          let y2 = p2.y * scaleY - imgH / 2;
          
          line(x1, y1, x2, y2);
        }
        
        // 閉合線條 (連接最後一點與第一點)
        let pLast = keypoints[indices[indices.length - 1]];
        let pFirst = keypoints[indices[0]];
        line(pLast.x * scaleX - imgW / 2, pLast.y * scaleY - imgH / 2, 
             pFirst.x * scaleX - imgW / 2, pFirst.y * scaleY - imgH / 2);
      };

      // 呼叫函式繪製各部位
      drawFeature(targetIndices);  // 嘴唇外框
      drawFeature(targetIndices2); // 嘴唇內側
      drawFeature(rightEyeOuter);  // 右眼外圈
      drawFeature(rightEyeInner);  // 右眼內圈
    }
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
