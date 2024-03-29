# 間隙限制

**警告！間隙限制的設定一般不應更改。** 增加間隙限制的數值可致嚴重影響效能。

間隙限制設定了錢包將產生及向前檢視使用的地址數量。間隙限制的預設值為20，這樣有兩個意義：

  1. 首次載入錢包時，將會掃瞄已使用的地址並預計地址間的最大間隙為20。

  2. 向使用者提供新地址時，錢包只會提供20個地址，其後回送。這樣就確保了間隙不會大於20。

只有以下兩個情況才需要更改這個數值：

  1. 如果你的錢包在v1.0之前就已經建立並重度使用，它可能會有非常大的地址間隙。如果你在恢復種子時留意到錢包餘額不全，你可以嘗試增將數值加到100甚至1000，並重新啟動Exilibrium。在解決餘額問題後，你可以將數值還原為20。

  2. 你想要一次過產生多於20個不同的位址。
