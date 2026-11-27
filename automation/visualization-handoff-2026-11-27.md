# PokéVerse 視覺化交接 — 2026-11-27（Asia/Taipei）

## 使用者指定與內容基準

- 使用者指定「今天先用昨天審過的」。唯一焦點仍為 #0001 妙蛙種子；main daily_focus=1/incomplete，沒有修改焦點或開始下一號。
- 沿用建設分支 `work/builder-main-rescue-20261126` 的 [11/26 審核](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/blob/work/builder-main-rescue-20261126/reviews/2026-11-26.md) 和 [11/27 已審交接](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/blob/work/builder-main-rescue-20261126/reviews/2026-11-27-approved-handoff.md)。對應研究 `data/guides.json` blob `ef67316c5a32cc1e0f7c4301be7a458aa7ed90d4` 的 17 篇，16 過／1 沒過；本輪沒有重新研究或要求重審已過項。
- main 原指南仍為舊 13 篇，本輪不覆蓋研究正文。僅在必要展示索引 `data/display-index.json.guide_snapshots` 保存 16 篇已過內容的原樣副本、來源 blob、審核日期與逐篇指紋。程式按 national_id/key 配對並驗證批准版本；內容改變或沒有批准的副本不接入。未過的第 1 代配招正文沒有複製至展示索引，舊版 passed 記號已撤下，顯示暫停理由。

## 實際網站變更

- main [5e3e13f62db925407db44ef258fd0ff08abf2cc3](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/5e3e13f62db925407db44ef258fd0ff08abf2cc3) 僅修改 `app.js` 與 `data/display-index.json`；提交後讀回 SHA 與測試版一致。沒有合併建設分支其他檔案或測試 workflow。
- 畫面可展示：基本身高體重、特性、六項種族值及常規 Lv.16/Lv.32 進化；19 組版本取得總覽（40 個版本標籤，不宣稱 40 版實機驗證）；朱／紫取得與劇情／休閒單打配招；GO 有日期與地區限制的取得渠道、歷史活動、招式及 PvE/PvP；Let's Go、BDSP、劍盾、Z-A、金銀水晶、紅綠藍皮卡丘、火紅葉綠、心金魂銀、X/Y 的已過取得指南，以及已過的金銀水晶配招。
- 基本資料使用專用數值圖與進化區，另外 15 篇以版本頁籤顯示正文、來源及查核／審核日期。原研究 status=draft/needs_review 沒有改寫；「內容審核：過」依獨立索引的特定版本決定。
- #0001 已批准圖片 `assets/generated/001-bulbasaur-stepping-01.jpg`，blob `bd82571241715f5f9c1c29dff978cb60dab347bf` 沿用既有 metadata／內部批准與展示索引；未加入 #0002/#0003 圖片或改寫第三方權利狀態。圖片解碼及可見性隨回歸測試通過。

## 驗證

- Work 雲端執行器 `node --check app.js` 通過；資料配對檢查確認 16 篇批准、其他編號資料保持、改動的副本被拒、第 1 代舊批准不沿用。
- 非正式測試分支 `work/visual-bulbasaur-art-release-20261125` 提交 [986ec35e100adcf77548b07bc3efa0dbd9055882](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/986ec35e100adcf77548b07bc3efa0dbd9055882)；既有免費標準 runner [Chromium run 45975782756](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45975782756) **success**，job 140427020805 日誌確認 PASS viewport 1440x900、390x844。包含圖片 1024×1024 解碼、搜尋、屬性篩選、排序、詳情、版本切換、新舊審核隔離、手機溢出與拒絕改動／未批准副本。原資料更新 workflow 未修改；測試 workflow 僅在測試分支更新相應斷言。
- 正式 [Workers 網址](https://pokemon-universe-pokedex.boragodragonfruit.workers.dev/) 在 Work 雲端瀏覽器實際進入 Cloudflare Access 登入頁；沒有關閉、繞過或修改保護。這只證明該入口的登入門檻；允許身份設定與本輪登入後 Visit 畫面未實測。CI 對正式網址的請求回 403，也沒有當作登入後畫面證據。
- Cloudflare GitHub check `Workers Builds: pokemon-universe-pokedex` 對正式提交回報 **completed / success**；Build ID `e0585cde-7842-4231-84d0-76e8313bfb90`，Version ID `28224d05-071c-4a3f-8931-04092b4553ca`。已核實建置／版本建立；正式登入後畫面仍另標未實測。

## 剩餘項目及交接

- 沿用昨日固定表 C3/C4 的缺口：G04/G06/G08/G09/G11–G13 主要取得前置與第 3–8 代適用配招仍未結案；第 1 代配招等級對照錯誤須修正後只審變動部分。這些不阻擋本輪 16 篇的使用。
- #0001 整體仍未完成；本輪未更改 progress、原攻略、審核或生圖紀錄，也未更動任何排程。第三方權利判定、內部批准、Access 與技術測試仍分別記錄。
- 本輪依使用者指定完成已審內容接入及相應測試；登入後正式畫面因雲端未登入仍缺證據，不冒稱親眼驗收。22:00 審核只需核對本次版本整合與剩餘固定缺口，不重開已過內容。後續持續 #0001。


## 最新審核後更新：18 篇全部通過

本節取代上文「新研究待裁決／C3、C4 未結案」的舊狀態，僅更新視覺化自身交接。

- [2026-11-27 固定版本審核](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/blob/ac79f7d6b42c3796650989db1a99af57d5ac0e9e/reviews/2026-11-27.md) 對 guides blob `00faf1f53dd7cf72775f7222da1b21988a3c7b65` 判 **18 過／0 沒過**，C1–C7 達標。第 1 代等級對照、六組取得前置和第 3–8 代劇情配招已關閉，不再重查相同問題。
- main [341caa556d48bbc8a83cccda08516f53acb19a9f](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/341caa556d48bbc8a83cccda08516f53acb19a9f) **只更新 data/display-index.json**，讀回 blob `449bb853595a293830c7896276e8fbe6fc7b3887`，18 篇指紋與批准均配對。新增／更新版本取得總覽、第 1 代修正配招及主系列第 3–8 代分組配招；撤下過時失敗標記。其他已審內容與圖片批准沿用。
- main 的 app.js 仍為已測 blob `bf36949089e012745d18540332128164479a198c`；沿用當天既有 Chromium 的相同通用讀取／分頁程式證據。新資料另有本次獨立內容審核、結構、指紋及既有渲染器檢查：18 篇批准、17 篇非基本資料正文完整輸出、巢狀招式未截斷、改動內容不沿用批准。沒有重跑瀏覽器、沒有把既有測試稱為新版正式畫面驗收。
- 審核確認 #0001 具備由 11/28 建設者核實後依序換 #0002 的資格；C8 登入後正式畫面仍未驗證，單列技術待辦。本視覺化者沒有自行改 daily_focus。
- 手機美編、收藏、快捷鍵、18 種屬性篩選等候選程式仍留在 `work/visual-polish-001-20261127`；本次沒有夾帶合併這些未驗收功能。候選索引同步 18 篇，下一次測試斷言已更新。
- Cloudflare Workers Builds 對 main 提交 341caa5 回報 completed／success；Build ID `a96f20a9-ce4b-4452-8661-fa5f9bd43730`，Version ID `2bdd0176-5015-4b8d-a354-5e86df5f7d90`。正式登入後 Visit 畫面仍未由本輪實測，不以建置成功冒充親眼驗收。


## 使用者截圖回報後的修正與正式發布

本節取代上文「候選功能未發布、等下一次測試」的狀態。使用者指出正式站看不到收藏／18 屬性，並提供原始欄位、待補任務外露的截圖，明確要求「再查一次」。本次僅針對這次具體回報追加一輪完整驗收；沒有變更每日最多一次的長期排程規則。

- 問題原因：先前便利功能只在候選分支，正式 app.js 仍是舊版本；原通用遞迴顯示器也把研究內部欄位與狀態碼直接當正文輸出。
- 正式程式提交：[59827bbed104bc4da868b125b0d942d9b33e5f82](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/59827bbed104bc4da868b125b0d942d9b33e5f82)。只修改 app.js、index.html、style.css。逐檔讀回與通過測試來源完全一致：app `8dc369fccb5de337944d9a5365886e30fa82c0d3`、HTML `f5d5208b012d93077cc2f6b0ca4ecfb35fb5c04c`、CSS `5e5cba254ef8a4c56deab814757fc8446c0ab5f4`。
- 介面：完整 18 種屬性篩選及收錄數（0 筆類別也保留）、屬性標籤與色點、星號收藏／只看收藏、重新整理保留收藏、搜尋清除／重設、桌面 `/` 搜尋、詳情固定關閉／回頂端、手機版本下拉與響應式版面。補出已批准 profile 的分類、日文名、第 1 代種族值與型態說明。
- 攻略：19 組取得方法與 7 組配招改用中文卡片／招式名稱與等級；`competitive_note`、`mode`、`moves`、`story_single`、`not_applicable` 等內部鍵或值不再直接顯示。已關閉的審核工作清單不作訪客正文；仍保留真實適用限制、未知／不適用資訊、來源及日期。長期追蹤範圍改為可展開說明，沒有把未查核內容改成已核實。
- 內容與素材：沿用既有 18 篇獨立審核及展示指紋、#0001 JPEG 與使用者既有品質／私人用途批准；不新增素材、不改第三方權利狀態、不改攻略正文、data/pokemon.json、progress、審核、生圖紀錄或 Access 設定。只操作當日 #0001，未改 daily_focus。
- 驗收：[既有 Chromium workflow run 46021216078](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/46021216078) 對測試提交 `1d8489ba551aeaa7d77f6de987aa9c677aaa164f` completed/success，job `140581031179` 明確 PASS 1440×900 與 390×844。測試資料／圖片與 main 相同；涵蓋圖片解碼可見性、18 類別與零結果、收藏保存、快捷搜尋、版本切換、所有攻略頁的原始碼排除、19／7 組卡片、手機溢出／關閉與批准指紋隔離。
- 截圖 artifact `visual-evidence`（ID `15206909764`，保留 3 天；digest `sha256:db191be1b4a5da716e74a7f8775183726ee1f0c711ab166aecb93fc28af244b2`）已下載並逐一查看桌面／手機收藏與配招畫面，未把自動化截圖當成正式 Visit。既有測試 workflow 僅在測試分支更新斷言及固定版本的截圖上傳；沒有合併任何 workflow 到 main 或改資料更新流程。
- 存取：沿用同日 Work 觀察到正式站 Cloudflare Access 登入門檻，CI 本輪正式網址 HTTP 403。未登入、未繞過、未改存取政策；這些證據不等於核實登入身份名單，也不是登入後正式畫面。正式畫面未由本輪實測。
- 建置結果待下節補記；不得以 GitHub 提交或測試成功宣稱正式畫面已親見。

- Cloudflare 已對正式程式提交 `59827bbed104bc4da868b125b0d942d9b33e5f82` 回報 completed/success（check `140583544891`）。Build ID `a4470eac-75fc-41ad-bd31-82a7215fac5e`；Version ID `e0576aee-1a29-4477-af94-1ea9d0f52bab`。這是正式建置／版本證據；登入後正式畫面仍未由本輪親自實測。
- 本次已完成使用者截圖指出的介面修正、同版測試、必要程式發布與建置核對。下輪沿用本版證據，不重開已過資料審核；若有新畫面問題只處理差異。C8 登入後畫面可另行補證，不要求建設 AI 增加遊戲研究。
