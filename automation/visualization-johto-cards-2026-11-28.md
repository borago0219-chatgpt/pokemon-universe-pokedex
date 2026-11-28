# 第二代基本卡片接入｜2026-11-28（Asia/Taipei）

使用者在第一代 151 張發布後要求「補第二代」。本次僅擴充網站基本卡片 #0152–#0251 共 100 張，總數 151→251；仍不代表圖片／攻略／八項完整度達標，不修改每日研究焦點、其他排程或研究正文。

## 資料與程式界線
- 以同一固定 PokéAPI commit `de6760be38b60a3024f1d9054330ff265f0dc619` 的 CSV 為來源，核對 languages（zh-hant=4／en=9）、pokemon_species_names、pokemon_species（generation_id=2）、pokemon_types（預設型態依 slot）及 types；100 個 ID 必須正好等於 152–251。
- 同一來源完整檔案的 blob SHA 與第一代來源一致；只擴大截取行數，來源連結／SHA 已在 data/display-index.json.catalog_card_source.source_files 保存。沒有使用圖像或抄錄攻略。
- catalog_cards 由 119 增至 219 筆，配合原 data/pokemon.json 的 32 筆共 251 張。原 119 筆、20 個中文標籤、18 篇指南批准／快照、圖片索引與其他展示資訊保留；只更新來源涵蓋前兩代的範圍。
- **app.js、index.html、style.css 完全不變**，沿用第一代通過驗收的通用合併／篩選／收藏／詳情與「基本卡片 · 圖片／攻略待補」標示。原資料更新器同編號優先，未來更新不會產生重複卡片。
- 不修改 data/pokemon.json、資料更新 workflow、攻略、圖片 metadata、原審核、daily_focus 或 Access。候選與正式均不新增未批准圖片。

## 實際檢查與可沿用證據
- Work 雲端來源結構檢查：第二代唯一 100 ID、雙語名稱、型態屬性／世代歸屬完整。
- Node 執行**同版正式卡片渲染器**的資料／邏輯檢查通過：251 唯一連續 ID、219 補充卡片、100 第二代；全卡中文；菊草葉／火球鼠／小鋸鱷／月亮伊布／大鋼蛇／洛奇亞／鳳王／時拉比名稱與屬性配對；18 類別的篩選數與資料一致且均有收錄；中文／英文／補零編號搜尋與基本卡片標示；原資料英文名及屬性保留。這是程式／資料檢查，不冒稱新的瀏覽器測試。
- 沿用未變 app blob `deb1bb73f441db21f15e6946cec55020a70d8942`、HTML `a3b3e78d6fad5890dea3d771814acf40d98c4f08`、CSS `b2a9f340cf16d2da5ebfb26c33225cb7ce4fee5d` 的 [Chromium 46096938389](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/46096938389) 桌面／手機成功及來源／注入／錯配隔離證據；該次原驗收資料是 151 張，**不是 251 張的新畫面驗收**。
- 不重跑同日網站驗收，也沒有將新的第二代資料稱為已由瀏覽器逐卡實測。採用既有通用介面證據＋本輪新增資料完整性／配對／渲染邏輯檢查。
- 新卡片仍未有專屬圖片或完整攻略，詳情明示缺漏與來源；不影響既有 #0001 的圖片與已審指南。

候選分支 work/visual-johto-cards-20261128。依使用者既有逐項發布授權，核對最新 main 與同版程式後只發布展示索引；正式提交、Cloudflare 結果與未驗證範圍於下節補記。
