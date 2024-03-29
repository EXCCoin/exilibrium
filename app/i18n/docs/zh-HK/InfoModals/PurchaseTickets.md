# 購買選票資訊

**帳戶** 是指從哪一個帳戶購買選票和接收獎勵。

**數量** 是指要嘗試購買的選票數量。

**選票手續費 (EXCC/kB)** 選票進入投票池的先後次序取決於選票手續費。在大量需求的時候，你需要增加這個數值以令你的選票先被接受打包。

**選票價格** 由網絡訂出的現有選票價格。每144個區塊會更新一次。

**VSP設定** 透過投票服務供應商(VSP)自動化操作。下面有更多相關資訊。

**逾時（區塊）** 選票手續費時常在短時間內上升，這可能令你無法買票。透過逾時設定，未於指定數量的區塊內打包的選票將被取消，這樣你就可以更高的手續費重試買票。如此欄為空白，選票在本價格區間內都不會逾時。

**交易手續費 (EXCC/kB)** Exilibrium會使用「分割」交易從錢包分割選票所需的確切金額，以避免對你的餘額造成阻塞。在你可以重用你的餘額前，該「分割」交易至少需獲得一個確認，這可能對你所有的餘額造成數分鐘的阻塞。沒有分割的話，你就需要等待選票交易獲得確認，而這可以用上數小時。此欄可維持為0.01。修改此數值不會影響你成功買入選票或投票的機率。

**投票地址** 用於投票的EXCC地址。

**VSP手續費地址** VSP手續費的繳費地址。

**VSP手續費 (%)** 使用VSP服務的手續費佔比。
