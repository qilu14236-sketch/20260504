let capture;
let facemesh;
let predictions = [];
const targetIndices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const targetIndices2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
const rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
const rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
// 臉部最外圈輪廓點 (Face Oval)
const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];

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
      
      // --- 繪製會發光的星星光環 ---
      push(); // 儲存目前的繪圖設定，避免 noStroke 或發光效果影響到其他部分
      
      // 取得鼻尖做為中心點 (編號 1)
      let pCenter = keypoints[1];
      let cx = pCenter.x * scaleX - imgW / 2;
      let cy = pCenter.y * scaleY - imgH / 2;

      // 設定發光效果
      drawingContext.shadowBlur = 15 + sin(frameCount * 0.1) * 5; // 讓光暈稍微有呼吸閃爍感
      drawingContext.shadowColor = 'rgb(255, 240, 100)'; // 光暈為黃色 (改用字串避免瀏覽器報錯)
      noStroke(); // 星星不要邊框
      fill(255, 255, 150); // 星星本體為淺黃色

      // 沿著臉部外圈陣列，每隔 2 個點畫一顆星星 (避免太擁擠)
      for (let j = 0; j < faceOval.length; j += 2) {
        let p = keypoints[faceOval[j]];
        let px = p.x * scaleX - imgW / 2;
        let py = p.y * scaleY - imgH / 2;
        
        // 計算從中心點向外擴張的向量
        let dx = px - cx;
        let dy = py - cy;
        
        // 額頭上方擴張倍率大一點 (保留給頭髮的空間)，下巴兩側小一點
        let expandFactorX = 1.3;
        let expandFactorY = dy < 0 ? 1.6 : 1.2; 

        let starX = cx + dx * expandFactorX;
        let starY = cy + dy * expandFactorY;

        push();
        translate(starX, starY);
        rotate(frameCount * 0.05 + j); // 讓星星自轉
        drawStar(0, 0, 6, 15, 5);      // 放大星星尺寸讓它更明顯 (內徑6、外徑15)
        pop();
      }
      
      pop(); // 復原繪圖設定
    }
  }
}

// 畫星星的輔助函式
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let i = 0; i < npoints; i++) {
    let a = i * angle;
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
