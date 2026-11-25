# 網站視覺化交接 — 2026-11-24

- 今日焦點：#0001 妙蛙種子。已讀 main 上 reviews/2026-11-24.md；未通過驗收，隔日繼續 #0001。
- 程式復原：提交 0b9f99bd344219ac5cdd63ede2272b0365bab354，修改 app.js、index.html、style.css，依 recovery/visual-001-20261124 的復原紀錄重建，沒有取回原始 e3e0a91。未修改 main、攻略資料、寶可夢資料、圖片紀錄或 Actions。
- 內容：通用國圖編號與指南配對、版本/GO 頁籤、身高體重與特性、種族值長條圖、進化文字、搜尋篩選及響應式樣式。指南顯示程式存在，但 privatePreview 預設 false，因此現在不會載入或顯示未審核指南；必須先確認伺服器端保護，才能考慮在合規測試環境啟用。前端判斷不是存取控制。
- 圖片：#001 候選已存在，但品質與權利均待審、website_use=not_approved，網站只用占位符。不得公開展示。
- 檢查：遠端三個程式檔內容與寫入版本逐字相符；JavaScript 語法檢查通過。GitHub 備援執行環境內的模擬 DOM 測試：17 張卡、搜尋妙蛙種子 1 張、草屬性 3 張；預設不讀指南，僅在記憶體暫時啟用預覽的模擬下按 #001 配對 11 筆指南；輸出跳脫與拒絕 javascript: URL 的樣本通過。此模擬不是實際瀏覽器或內容正確性驗收。
- 建置：使用者表示已關閉 Preview branches 建置；此分支前兩個提交的 GitHub checks 暫無 Cloudflare build 記錄，僅為查核時間點觀察，不代表已驗證 Cloudflare 完整設定或存取政策。正式網址曾到達 Cloudflare Access 登入頁，但本輪沒有驗證保護或部署狀態。
- 未完成：真實桌面/手機 Work 瀏覽器測試、私人預覽與 Access 保護核實、版本切換畫面、圖片權利與品質審核、雷達圖與互動進化、逐版本及 GO 內容審核。未經審核不得合併 main 或發布。
- 收工原因：目前沒有可驗證的 Work 雲端瀏覽器與受保護測試站；復原程式已保存 GitHub 測試分支。下一輪先檢查分支及 main 最新狀態和審核交接，在受保護的 Work 環境中繼續實測；不得自行換號。


## 功能發布與角色完整度：分開交接

- 發布候選：可先驗收搜尋、屬性篩選、編號排序、鍵盤焦點與響應式介面；各功能應分別指明版本 SHA、測試結果、安全檢查與獨立審核結果。候選功能目前未經真實瀏覽器驗收，也未獲逐項發布審核，不可視為已部署。
- #001 的 profile 指南整筆狀態 draft；不能假設其中所有欄位已獨立核實。請審核員逐欄標註來源及可展示狀態；指南或圖片待審不應阻擋與其無關、已符合發布條件的介面功能。
- 角色完整度：依 reviews/2026-11-24.md 尚未通過，繼續 #001；這是另一個決策，不應自動判定全部獨立功能不得發布。
- 建設者下一步：以最新版 main 和測試分支對照，逐項提交獨立的檢查證據；通過獨立審核、功能與安全測試、素材權利及 Cloudflare Access 保護確認後，依使用者授權合併該項合格變更並驗證部署與正式畫面。

## GitHub Actions 瀏覽器測試提案（尚未建立，待使用者授權及審核 AI 評估）

- 預計新增獨立 `.github/workflows/visual-browser-tests.yml`，不修改現有資料更新工作流程；只在測試分支 push 執行，不觸發部署，也不提交資料。
- 使用 GitHub 標準 Ubuntu runner，固定安裝 Playwright Python 與 Chromium；以 runner 內本機 HTTP 伺服器載入結帳的公開測試分支，只測預設關閉草稿的版本。這是 GitHub 雲端暫存測試環境，並非使用者本機；不把伺服器對外公開，不載入 Cloudflare Access 帳密或其他 secrets。
- 桌面與手機視窗檢查：資料載入、搜尋 #0001、草屬性篩選、開啟/關閉詳情、空結果、頁面錯誤、非預期指南載入。版面截圖若含草稿或受限素材則不產生、不保存；初版不保存 artifacts/cache，降低儲存費及洩漏風險。
- 工作流程只要求 `contents: read`，不需要寫入 GitHub；使用 timeout 和 concurrency 取消過期執行。執行前確認 repo 仍公開、runner 免費、可用以及帳號用量和儲存限制；不得啟用付費 runner 或購買服務。
- 這種測試不能核實 Cloudflare Access 政策或已部署正式網址，也不代替內容與圖片權利審核。草稿/版本切換可用不含真實待審資訊的測試假資料另做測試，但不得當作正式內容或受保護預覽驗收。
- 請審核 AI 評估測試設計並分開提出各功能發布結論與 #001 完整度結論。未取得使用者對新增 workflow 的明確授權前，不建立工作流程或執行測試。


## 已授權並執行 GitHub 雲端瀏覽器測試

- 使用者已明確授權上述獨立 workflow；測試檔：.github/workflows/visual-browser-tests.yml，提交 fad387ea638739efada1599918eab0bf811d48c3。只在本測試分支 push 觸發，標準 Ubuntu runner，contents: read，不保存憑證，不修改每日資料工作流程。
- 實際執行：[GitHub Actions #45412495315](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45412495315) success；Chromium 1440×900 和 390×844 均 PASS。核對 #001 與數字排序、搜尋妙蛙種子、詳情開關、草屬性、空結果、頁面例外、水平溢出及預設未載入 guides.json。
- 此為 GitHub 雲端 runner 對本分支本機伺服器進行的自動化 Chromium 測試；不是已部署網站驗收、Cloudflare Access 安全保護驗證、圖片權利審核、版本分頁測試或人工視覺審查。測試用 runner 不是使用者本機，未使用正式網站登入資訊。
- 請品質審核 AI 以 fad387ea 的網站程式和上述記錄，分項審核搜尋、排序、篩選、詳情及響應式，分別回報可發布/待修/待核；同時獨立保持 #001 完整度未通過。正式合併仍須相應功能審核、安全和 Access 確認。
- CI 日誌警告 checkout/setup-python 所用 Node 20 動作已由 GitHub 強制轉至 Node 24，現次成功；後續應檢查並更新固定的 action 版本。


## #0001 編號搜尋改善 — 待獨立發布審核

- 程式提交 [c5d4eaf](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/c5d4eafde846a5c048229927e496fe9809cfde46)：在既有搜尋加入 #0001、0001 這類補零的全國圖鑑號碼；原有一般數字子字串、中文和英文搜尋不變。
- 語法及模擬 DOM：#0001、0001、妙蛙種子、bulbasaur 均找到 #001；#9999 無結果；一般數字 1 仍作子字串搜尋。這些特定輸入尚未由真實瀏覽器測試。
- 同一程式提交的 [GitHub Actions 實際 Chromium 測試](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45413327265) 成功，涵蓋桌面和手機下既有中文搜尋、篩選、詳情、數字排序、空結果與基本版面；既有 workflow 未涵蓋 #0001 字串，因此不可聲稱該字串已經過實際瀏覽器測試。
- 請品質審核 AI 分開驗收此搜尋功能的程式與實測缺口、Cloudflare 存取保護，以及 #001 資料完整度。未經對應功能獨立審核及存取保護確認，不合併 main。候選圖尚未獲准展示。


## 使用者圖片審核補充

- 使用者於本對話表示「我親自審核通過圖片」；對象為目前討論的 #0001 候選圖 assets/generated/001-bulbasaur-stepping-01.jpg，blob SHA bd82571241715f5f9c1c29dff978cb60dab347bf。記錄為使用者對圖片品質的審核通過。
- 這句話未具體說明展示權利依據；原 metadata 的 rights_review=required、website_use=not_approved 尚未變更。須確認適當展示權利後才依原發布規則接入；本交接不修改生圖 metadata，也不代替法律或授權證據。


## 圖片顯示接入：準備中

- 使用者明確要求在網站顯示 #001 圖片；品質審核報告已接受該圖品質。程式 [4147d41](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/4147d41b600d28b299dc1b6e8b9dd414029d956c) 在測試分支準備圖片卡片，含延遲載入、替代文字及載入錯誤回退。
- 程式依 metadata 只有 national_id=1、檔案路徑完全相符、rights_review=approved 且 website_use=approved 時才顯示；當前 metadata 仍為 required / not_approved，因此目前仍顯示占位。不得把使用者的品質通過誤記為第三方權利審核通過，不擅自改生圖 metadata。
- Leonardo 官方價格頁稱免費使用者享有非專屬使用授權；其服務條款不保證無第三方智慧財產權侵害。請權利審核依照實際使用與相關權利人條款判斷，不能將 Leonardo 對生成圖的授權當成已取得寶可夢角色權利的證據。
- GitHub Actions [45415452225](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45415452225) 測試成功（兩種視窗的既有介面測試），但測試期間目前圖片受限未顯示；模擬中待審顯示 0 張、假設審核通過顯示 1 張、編號或路徑錯誤顯示 0 張。這不是實際圖片瀏覽器顯示驗收。正式網站和 Cloudflare Access 狀態本輪未驗證，main 未修改。
- 下一步：取得權利狀態明確決定，再在受保護環境實際檢查圖片載入、尺寸與卡片，經獨立功能審核和 Access 確認後，只將使用者批准的圖片功能整合至 main；不可把其他測試分支功能一併合併。


## 使用者確認展示 — 測試分支啟用

- 2026-11-24 使用者回覆「我確認通過」，指前述 #001 圖片的展示待審；依該明確確認，在測試分支提交 [f67abfc](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/f67abfc71ac8885eea8592ad295d89f61f596e7b) 啟用該圖片。此為使用者核准的紀錄，並非已核實任天堂或其他第三方權利人授權的證明。
- 本次僅在程式中對應 #001、指定檔案路徑及 metadata 所列 blob SHA；其他角色不受影響。未修改生圖 metadata，因此該檔仍標示 rights_review=required、website_use=not_approved，與使用者新確認存在狀態差異；請負責權利紀錄的審核流程核實並協調，勿把原紀錄當成已同步更新。metadata 的 blob_sha 是宣告值，執行時未對圖片位元組重新計算 Git blob SHA。
- [雲端 Chromium 測試 45415897801](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45415897801) 通過桌面/手機既有測試；伺服器記錄兩次 JPG 及 metadata HTTP 200。既有測試沒有斷言圖片解碼、正確畫面或視覺布局，不能視為完整圖片畫面驗收。
- 本輪未變動 main、Cloudflare Access 或生圖紀錄。正式上線仍需處理上述權利狀態差異、針對圖片功能的獨立審核及正式網址存取保護確認；使用者要求其他 main 內容不要改，合格後只整合必要圖片顯示修改。


## 2026-11-24：正式記錄使用者批准及圖片實測

- 管理者已明確批准 #001 畫面品質和私人圖鑑使用；此決定已同步至 main 的正式圖片 metadata：[2a00e89](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/2a00e89a33f7f2d7e90a778b2936d7b5416a7591)。不再要求重複品質或專案批准。正式紀錄分離 project_approval 與 third_party_rights，未聲稱權利人已授權。
- 官方 Pokémon 支援頁要求不要在專案使用或關聯其角色、名稱與設計；其日本權利聲明亦指出其使用 fan art 不授予超出私人非商業居家使用的權利。這是權利人政策，不等於本紀錄認定本項私人網站必然違法。Leonardo 的生成授權不等於 Pokémon 角色授權。
- 最新測試分支 workflow 成功：[45416666847](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45416666847)。Chromium 桌面與手機視窗分別斷言圖片可見、已完成解碼、自然尺寸 1024×1024，皆通過。未登入正式網址自動請求回傳 HTTP 403，未能確認是否為 Access 登入保護或其策略。
- 正式圖片顯示程式沒有合併；main metadata-only 提交可能觸發 Workers Build，建置／部署另查。待釐清適當使用權利以及 Access 實際保護、獨立功能審核後，只整合必要圖片顯示功能，不帶其他功能。圖片本身早已在公開 GitHub repo；Cloudflare Access 不會保護 GitHub。


## 2026-11-25 單項發布與私人條件查核

- daily_focus 仍為 2026-11-24 #001、未完成，今日未見新焦點；維持原號，不自行設定或推進。建設及插圖最新交接尚未顯示今日更新。
- #001 圖片已獲管理者品質及私人用途批准，正式 metadata 112233e0bcc3cb3bf97606947c9da4e55eb45d09 已記錄；沿用 [Chromium 圖片解碼與桌面/手機測試 45416666847](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/45416666847)，不重複要求批准或測試。
- 限制：GitHub repo 目前公開、#001 JPEG 可讀，Leonardo 預設免費生成可見性及正式/預覽/直接素材 URL 保護未能完整核實；正式網址雲端未登入探測得到 HTTP 403，但無法歸因 Access。不能以已確認私人使用為前提將圖片部署；不聲稱該政策等同法律結論。
- 已隔離獨立 #0001 搜尋候選 [999154f](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/commit/999154f01f59a99e85461077422a07a45487d6b7)，分支 work/visual-dex-search-release-20261124，僅 app.js、無圖片與草稿，模擬 #0001/0001/中文/英文搜尋通過；原有相同搜尋邏輯在 c5d4eaf 上的 Chromium 介面測試通過，但此單獨分支未被該 workflow 直接測試，#0001 字串也未被該 workflow 實測。請按最新規則判斷功能批准與必要測試；未經確認 Access 保護前不部署。
- 可行替代：Pokémon 官方媒體站的素材有可撤銷的非商業資訊/編輯用途授權；須找到實際適合的 #001 原始圖片、確認本私人圖鑑用途是否屬於所列範圍並遵守不可修改、不得暗示官方關係等規定，不能把該授權擴及 Leonardo 圖片。https://press.pokemon.com/en/Assets-Use-Terms
- Work 雲端環境清單回覆 MCP -32000；不使用使用者本機。最小解除條件：確認正式網址和直接素材網址無登入時受 Access 限制，以及本人登入可訪問；確認 GitHub/Leonardo 是否具備使用者要求的私人範圍；如無法私人化，使用符合條件的來源素材或排除該圖片。禁止繞過登入、額度或更改保護。
