# 第三至第九代基本卡片補齊｜2026-11-28（Asia/Taipei）

使用者在第二代發布後要求「三到最新的一代都補完」。本次延續基本卡片擴充，新增 #0252–#1025 共 774 張，原 251 張增至 1,025 張；圖片、攻略與角色八項完整度仍分開，未啟動 774 隻攻略研究，也未改 daily_focus 或其他排程。

## 最新範圍核對
- 官方全國圖鑑 https://www.pokemon.com/pokedex/ 的編號範圍列至 #1025；2026-08-25 官方 Character Guide 公告 https://www.pokemon.com/uk/news/the-pokemon-deluxe-character-guide-from-pikachu-press-is-available-now 同樣以 #0001–#1025 描述完整全國圖鑑。
- 下一代 Pokémon Winds／Waves 官方公告預定 2027 年推出：https://pokemon.gamespress.com/Pokemon-Continues-30th-Celebrations-with-the-Unveiling-of-Pokemon-Wind 。本輪使用可核實的正式編號資料；不把尚未列入本資料集的已公告角色猜排成 #1026 起，也不複製待核的編號。
- 本批世代／數量：第三代 135、第四代 107、第五代 156、第六代 72、第七代 88、第八代 96、第九代 120；合計 774。資料範圍與「基本卡片」完成分開於完整攻略／圖片完成。

## 來源與展示資料
- 延用固定 PokéAPI commit `de6760be38b60a3024f1d9054330ff265f0dc619`。pokemon_species_names 的三個連續行區塊 SHA 一致，完整解析 zh-hant=4、en=9；pokemon_species 核對各編號所屬世代；pokemon_types 按 slot 對應 types。
- 另核對 pokemon.csv：#0001–#1025 的 pokemon_id 與 species_id 一致且 is_default=1，避免把地方／超級／其他型態當不同全國編號。pokemon.csv blob `a425fe0fda9d4682cc016225a642518d789d1ab3` 來源也加入 source_files。
- data/display-index.json.catalog_cards 從 219 增至 993 筆，原 data/pokemon.json 的 32 筆由資料流程優先，合計 1,025。前 219 筆逐位元等值保留；所有舊中文標籤、攻略快照／審核決策、圖片索引等其餘資料不變。
- 本批只更新展示索引與自身交接紀錄。app.js／index.html／style.css 完全不變；data/pokemon.json、既有 workflow、攻略、生圖 metadata、審核、Access、進度與其他排程不修改。
- 卡片共用已驗收的搜尋、篩選、排序、收藏與詳情；新增者顯示「基本卡片 · 圖片／攻略待補」及日期／固定來源，不繼承 #0001 的批准、攻略或圖片。

## 實際檢查及測試邊界
- Work 雲端來源解析確認新增 IDs=252–1025 共 774、各代數量與雙語名稱／預設型態有序屬性完整。
- Node 執行未變的正式卡片程式之資料與渲染邏輯檢查通過：1,025 唯一連續 ID、993 補充卡片、全卡中文、各代起訖與代表種族名稱／屬性配對、18 類別數量與資料一致、中文／英文／補零編號／重音／標點搜尋、升降序、原資料英文／屬性及 18 筆審核／#0001 圖片索引保留。模板初次合併＋字串渲染實測約 26.1 ms，產生標記 731,309 bytes；**這不是瀏覽器效能或手機畫面測量**。
- 同版 app blob `deb1bb73f441db21f15e6946cec55020a70d8942`、HTML `a3b3e78d6fad5890dea3d771814acf40d98c4f08`、CSS `b2a9f340cf16d2da5ebfb26c33225cb7ce4fee5d` 沿用 [Chromium 46096938389](https://github.com/borago0219-chatgpt/pokemon-universe-pokedex/actions/runs/46096938389) 的桌面／手機及安全隔離成功證據。該次資料為 151 張，不宣稱它是 1,025 張的新畫面驗收。
- 不重跑同日網站完整驗收；本輪只做新增資料、同版邏輯與保存完整性檢查，保留「正式畫面未由本輪實測」。沒有新增 CI workflow 或將檢查冒稱瀏覽器逐卡實測。
- 沿用最近 Work 觀察到的 Access 登入門檻與當日 CI 未登入正式網址 HTTP 403；設定未改、未增加受限圖片。這不等於本輪重新核對身份名單或登入後畫面，不繞過保護。

候選分支 work/visual-national-cards-20261128；核對最新 main 與程式 SHA 後只整合必要索引，正式提交／建置結果另補記，不提前宣稱。
