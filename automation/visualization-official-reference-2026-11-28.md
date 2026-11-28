# 官方參考圖 #0002–#0011 接入｜2026-11-28（Asia/Taipei）

## 使用者指令與內容優先
使用者明確要求「從002開始 都用生圖AI下載的官方圖 你把圖加上去就好」，另重申「每天還是要接入審核過的內容，不要只用圖」。本輪已更新**本視覺化任務** Automation_a4fcd1401a6881918e3e44d158593a9a：先接入 daily_focus 已審核基本資料與攻略，再同步下載圖。保留每天 Asia/Taipei 21:30、啟用狀態、原環境選擇與其他限制，未修改其他排程。
最新建設分支 guides blob 仍 `00faf1f53dd7cf72775f7222da1b21988a3c7b65`，與最新通過的 18 篇審核一致；main 展示快照已全數接入，沒有漏掉同版已核內容。沒有用圖片替代研究、沒有改 daily_focus、guides 或 data/pokemon.json。

## 下載來源與實圖
- 下載 AI 分支 work/reference-artwork 固定提交 `462baaa27b96c0334a4174bc785b7282ecd305c4` 已存 #0002–#0011 共 10 PNG 及同名 metadata，來源 PokeAPI/sprites 的 official-artwork。僅挑選這 20 個 blob，不合併該分支的舊網站／研究資料，不改其獨立下載進度。
- 本輪從 GitHub base64 讀回每張檔案，重新計算 Git blob SHA，比對 metadata.source_git_blob_sha／來源樹一致；全部 PNG 475×475 可解碼。已實際查看整批對照圖，編號／角色相符，未見浮水印或仿簽名。沒有更改圖像像素或移除原標記。
- #0001 舊批准 AI 圖保持卡片／詳情原狀；從 #0002 起本批改用已下載官方參考圖。未接入其他未批准 AI 圖，也不自行生成或下載下一批。

## 使用決策與權利紀錄
- 使用者本輪對下載圖的專案內使用決定保存在 data/display-index.json.artworks 的固定 path／SHA／project_approval；不只寫在報告，也不改寫下載者原始 metadata。
- 通用 assessment `official-reference-20261128` 分開記錄內部批准、條件式使用風險、來源／權利人、目的／性質／質量與市場因素及公開儲存情況。此為非商業圖鑑角色辨識與屬性教學脈絡的條件式合理引用評估，**不是權利人授權、CC0 或法律保證**。
- 已查來源 LICENCE：圖片著作權仍屬 The Pokémon Company。官方 FAQ 未授予專案使用許可；不忽略其否定許可的立場，也不把一般不授權聲明當成已裁定法定合理引用不得成立。依智慧財產局對第 52／65 條的個案框架記錄支持因素與不利因素；完整創作性圖片及公開副本仍有不確定性。
- 實際 GitHub repository private=false、visibility=public；來源分支與之後 main 圖檔均不可冒稱私人。評估不以隱匿素材為依據。網站沿用既有 Access 門檻及使用者維持保護的設定證據，不改／繞過保護。設定／來源／用途實質變化時只重看差異。
- 限於既有非商業角色參考／教學顯示，保留來源與著作權，不售圖、不做素材下載商品、不宣稱官方合作。此共通評估可供同來源後續批次核對差異，避免每日重開相同泛泛待審。

## 程式變更與檢查
- 通用 artwork loader 支援 assets/reference/ 的正確編號路徑、固定來源／blob／專案批准與 assessment；實際讀回原 metadata 核對 id／file／source／source_git_blob_sha，不讓舊「尚未接入」生產階段標記覆蓋最新網站內部批准，也不把 metadata 改寫為第三方授權。
- 卡片與詳情讀同一索引；詳情列來源／權利標示。測驗只接受該 loader 通過的官方圖路徑，顯示在名字上方；處理載入中、缺圖、載入失敗與舊題圖片晚到。未接入圖片的編號仍保留佔位圖，題庫與計分不變。
- 來源 metadata／PNG 原樣複用；所有原 18 篇快照／審核、1,025 卡片、原目錄及 #0001 圖片批准保持。
- Work 雲端 PNG 解碼、Git SHA、Node loader 的錯配／批准／來源／路徑／重複拒絕檢查通過；測驗 12 項題庫／控制器測試通過，新增圖片成功／失敗／舊題載入的處理。這些不是新瀏覽器證據。
- 使用者於本對話另准本批一次桌面／手機驗收並發布。既有免費 Chromium [run 46105026223](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/46105026223) 已 completed/success，job 140855736506；測試提交 `bfebfdfc64d1743557c2dae8b2d054b12c1acfef`，對應候選程式 `693ff362d22817ed782b381e445ffa8a9a8ab7bf`。全部 10 圖 SHA／metadata／解碼、卡片／詳情／測驗／來源、桌面 1440 與手機 390、圖片失敗佔位及 1,025 卡片／攻略／收藏／測驗回歸通過。已檢視手機與桌面截圖，未重跑同版驗收。

候選分支 work/visual-official-art-002-011-20261128，已取得本批額外驗收／發布允許並通過，不再詢問相同品質或使用批准。


## 正式整合與交接
- main 程式提交 [4588a323bdd95dfe5706d402edeff9a164050ac2](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/4588a323bdd95dfe5706d402edeff9a164050ac2)。僅 5 個網站檔案（app.js、type-quiz.js、index.html、style.css、data/display-index.json）與 20 個原始 PNG／metadata；未合併測試 workflow、測試檔或下載者進度。
- 發布前重讀 main `651e1816fef23cfef90600f9f13cc806dd4fe627` 與 5 個來源 SHA，使用 expected_sha 更新，發布後逐個核對 25 個 blob 與測試來源一致；其他既有檔案未變。原始攻略、daily_focus、data/pokemon.json 與其他排程不變。
- 圖片索引：#0002 妙蛙草、#0003 妙蛙花、#0004 小火龍、#0005 火恐龍、#0006 噴火龍、#0007 傑尼龜、#0008 卡咪龜、#0009 水箭龜、#0010 綠毛蟲、#0011 鐵甲蛹；卡片／詳情與抽到這些題目的測驗顯示實圖。其餘無圖編號仍有佔位，不宣稱全圖鑑已補齊。
- 測試證據 artifact `15247675388` / visual-evidence，SHA256 `fae9f407be92cd6035776a7a5b46433fdcbc76c28b2e77380c74b74d6a8a4b87`；保存期限 2026-12-01，測試程式和 run 紀錄仍可追溯。截圖 official-card-390／1440、official-detail-390、official-quiz-390／1440 已查看。
- 正式首頁未登入 HTTP 回應為 403；這項觀察不單獨等同本人 Access 完整政策驗收。沿用既有已記錄登入門檻及使用者維持保護的設定證據；本輪無修改 Access，未繞過登入。正式登入後 Visit 畫面未由本輪親自實測，CI 測的是固定版本測試站。
- 下一輪先對照建設與審核新資料；目前同版 18 篇已核內容已同步。新資料未通過前不猜填、不把整隻角色宣稱完成；後續官方下載批次沿用共同來源評估，核對差異與固定版本後接入，不自行下載／研究下一隻。
- 本輪完成指定圖片批次和每日內容優先排程修正；非新的主要研究輪，不增加攻略研究範圍。每日瀏覽器驗收額度依本次追加授權已使用，後續新變更需有適當版本測試才發布。

- Cloudflare Workers Builds 對程式提交 completed/success（check `140857058939`），Build ID `5f38bb33-3509-4d80-a1a9-09cecf6c3a72`，Version ID `8fa83cb6-9b74-4d68-b627-e42ddd048456`。程式整合與正式建置成功；沒有以此冒稱登入後已親眼看到畫面。
