
// 1. 網頁載入時，自動初始化預選卡片的高亮外框樣式
document.querySelectorAll('.options-grid').forEach(grid => {
    const checkedRadio = grid.querySelector('input[type="radio"]:checked');
    if (checkedRadio) {
        checkedRadio.closest('.option-card').classList.add('selected');
    }
});

// 2. 點擊選項卡片時，自動同步 Radio 單選鈕狀態，並切換粉色高亮邊框
function selectOption(type, element) {
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
    
    // 取得當前單選鈕的 name 屬性，用以尋找同群組的其他選項
    const name = radio.getAttribute('name');
    document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        // 移除同群組其他卡片的點選樣式
        r.closest('.option-card').classList.remove('selected');
    });
    
    // 為當前點擊的卡片加上粉色外框樣式
    element.classList.add('selected');
}

// 3. 【清除重算】按鈕功能：將所有輸入欄位歸零，並恢復預選選項
function resetForm() {
    // 清空上下胸圍輸入框
    document.getElementById('bust-size').value = '';
    document.getElementById('band-size').value = '';
    
    // 恢復 Step 2 預設值（第一個：上胸無肉）
    const shapeRadios = document.querySelectorAll('input[name="breast-shape"]');
    shapeRadios[0].checked = true;
    shapeRadios.forEach(r => r.closest('.option-card').classList.remove('selected'));
    shapeRadios[0].closest('.option-card').classList.add('selected');

    // 恢復 Step 3 預設值（第二個：1~2cm）
    const padRadios = document.querySelectorAll('input[name="pad-thickness"]');
    padRadios[1].checked = true;
    padRadios.forEach(r => r.closest('.option-card').classList.remove('selected'));
    padRadios[1].closest('.option-card').classList.add('selected');
}

// 4. 【核心計算邏輯】按鈕功能：讀取數值並智慧換算內衣尺碼
function calculateSize() {
    // 讀取輸入的上胸圍與下胸圍，並轉換為浮點數
    const bustInput = parseFloat(document.getElementById('bust-size').value);
    const bandInput = parseFloat(document.getElementById('band-size').value);

    // 阻擋未輸入或輸入不完整的狀況
    if (!bustInput || !bandInput) {
        alert('請完整輸入上胸圍與下胸圍尺寸！');
        return;
    }

    // 邏輯檢查：上胸圍必須大於下胸圍
    if (bustInput <= bandInput) {
        alert('上胸圍必須大於下胸圍，請重新確認量測數值。');
        return;
    }

    // --- 【第一階段：決定下胸圍尺碼 (Band Size)】 ---
    let bandSize = '';
    if (bandInput >= 62.5 && bandInput < 67.5) bandSize = '65';
    else if (bandInput >= 67.5 && bandInput < 72.5) bandSize = '70';
    else if (bandInput >= 72.5 && bandInput < 77.5) bandSize = '75';
    else if (bandInput >= 77.5 && bandInput < 82.5) bandSize = '80';
    else if (bandInput >= 82.5 && bandInput < 87.5) bandSize = '85';
    else if (bandInput >= 87.5 && bandInput < 92.5) bandSize = '90';
    else if (bandInput >= 92.5 && bandInput < 97.5) bandSize = '95';
    else {
        // 若超出常規範圍的極端值處理
        if (bandInput < 62.5) bandSize = '65';
        else bandSize = '100';
    }

    // --- 【第二階段：計算原始胸圍差，並根據條件進行加權微調】 ---
    let difference = bustInput - bandInput;

    // 獲取 Step 2 胸型狀況 與 Step 3 襯墊厚度的選取值
    const breastShape = document.querySelector('input[name="breast-shape"]:checked').value;
    const padThickness = document.querySelector('input[name="pad-thickness"]:checked').value;

    // 依據胸型肉量豐滿度，微調胸圍差權重
    if (breastShape === 'soft') {
        difference -= 0.5; // 上胸無肉/軟胸者，脂肪易流失，罩杯估計採保守估算
    } else if (breastShape === 'plump') {
        difference += 0.5; // 上胸有肉/挺胸者，乳房上緣飽滿，預留肉量空間
    }

    // 依據平時習慣的襯墊厚度，微調內衣容積預留空間
    if (padThickness === 'thick') {
        difference += 1.5; // 平常習慣穿2cm以上厚墊，內衣空間會被壓縮，建議預留容積拿大一杯
    } else if (padThickness === 'thin') {
        difference -= 0.5; // 穿1cm以下薄襯墊時，最貼近真實胸圍，斟酌微調
    }

    // --- 【第三階段：根據調整後的胸圍差，對照標準罩杯等級 (Cup Size)】 ---
    let cupSize = 'A';
    if (difference < 10) cupSize = 'A';
    else if (difference >= 10 && difference < 12.5) cupSize = 'A';
    else if (difference >= 12.5 && difference < 15) cupSize = 'B';
    else if (difference >= 15 && difference < 17.5) cupSize = 'C';
    else if (difference >= 17.5 && difference < 20) cupSize = 'D';
    else if (difference >= 20 && difference < 22.5) cupSize = 'E';
    else if (difference >= 22.5 && difference < 25) cupSize = 'F';
    else cupSize = 'G'; // 超過 25cm 以上歸為 G 罩杯

    // --- 【第四階段：組合最終尺碼並渲染至彈出視窗】 ---
    const finalSize = bandSize + cupSize; // 例如: "75C"
    let adviceText = `依據您提供的數據，建議您的尺碼為 ${finalSize}。`;
    

    // 將計算結果寫入彈出視窗對應的 HTML 元素中
    document.getElementById('size-output').innerText = finalSize;
    document.getElementById('desc-output').innerText = adviceText;

    // 為彈出視窗加上 .active 樣式，使其平滑顯示在畫面上
    document.getElementById('result-modal').classList.add('active');
}

// 5. 關閉彈出結果視窗
function closeModal() {
    document.getElementById('result-modal').classList.remove('active');
}

// 當點擊彈出視窗外圍的半透明黑底時，也自動觸發關閉
document.getElementById('result-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});


