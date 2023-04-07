# ExchangeCoin Constitution

The ExchangeCoin blockchain harnesses a hybrid consensus mechanism, combining Proof-of-Work (PoW) and Proof-of-Stake (PoS) to ensure optimal security and performance. With the Equihash (N=144, K=5) PoW algorithm, which is designed to be ASIC resistant, ExchangeCoin allows supporters to actively participate in securing transactions while preventing centralization of computational power by a single actor, an issue that has affected other blockchain networks. This document serves to clarify the expectations of prospective and current ExchangeCoin users, outlining the social contract between them and the project, without superseding the network's consensus rules in the event of a conflict.

---

## Principles

* *Free and Open-Source Software* - All software developed as part of ExchangeCoin will be free and open-source software.
* *Free Speech and Consideration* - Every individual has the right to express opinions and ideas without fear of censorship. All constructive speech grounded in fact and reason will be given due consideration.
* *Multi-Stakeholder Inclusivity* - Embracing inclusivity, ExchangeCoin actively endeavors to incorporate a diverse range of perspectives and users within a multi-stakeholder system.
* *Incremental Privacy and Security* - Privacy and security are top priorities, balanced against the complexity of implementing them. ExchangeCoin will continuously and proactively integrate additional privacy and security measures, both in response to threats and as needed.
* *Fixed Finite Supply* - With a finite issuance not exceeding 32,003,133.2 EXCC, ExchangeCoin maintains a per-block subsidy that adjusts every 6,144 blocks (approximately 21.33 days) by reducing by a factor of 100/101, starting with a genesis block subsidy of 38 EXCC.
* *Universal Fungibility* -  As a fundamental aspect of ExchangeCoin's store-of-value proposition, universal fungibility will be protected, with ongoing monitoring of potential attacks and active pursuit of countermeasures as necessary.

---

## Blockchain Governance

* Governance within the network is achieved directly through the blockchain by integrating a block's proof-of-work (PoW) with its proof-of-stake (PoS). PoS voters, or stakeholders, have the power to override PoW miners if 50% or more stakeholders vote against a specific block created by a miner.
* Stakeholders are individuals who purchase one or more tickets, which involves locking a certain amount of EXCC. The required amount of locked EXCC, known as the ticket price, varies as the system aims to maintain 40,960 tickets in the live pool.
* In each block, a lottery system selects 5 tickets to vote. When a ticket is selected, a designated wallet must actively respond with a vote. For a block to be accepted by the network, it must include votes from at least 3 of the 5 selected tickets. The blockchain cannot progress without active stakeholder participation.
* Stakeholders must wait an average of 28 days (8,192 blocks) for their tickets to be eligible to vote, during which the EXCC used to purchase the ticket remains locked. The actual waiting time may be longer or shorter than the average, as the ticket selection process is pseudorandom. Tickets that have not been selected to vote will expire after 40,960 blocks (~142 days).
* Stakeholder votes recorded in the blockchain are rewarded with 6% of each block subsidy, with each block accommodating up to 5 votes for a total of 30% of each block subsidy.
* PoW is allocated 70% of each block subsidy, provided that their subsidy scales linearly with the number of PoS votes included (e.g., including 3 of 5 votes reduces the PoW subsidy to 70% of the maximum).
* The majority decision of the votes determines the validity of the regular transaction tree of the previous block, including the PoW subsidy. Consequently, if PoS voters vote against a particular PoW block, the PoW reward is invalidated, as are any regular transactions within that block.
* ExchangeCoin's approach to amending the consensus rules is also driven by stakeholder voting. The process starts when at least 95% of PoW miners and 75% of PoS voters have updated their software to a new version containing latent rule changes. Upon meeting these conditions, an 8,064-block (~4 weeks) voting period commences to decide whether the latent rule changes should be activated.
* For a rule change proposal to pass, at least 75% of the non-abstaining tickets must vote Yes. If this threshold is met, and a quorum of 10% of tickets voting Yes or No is reached, the rule change will be activated 8,064 blocks (~4 weeks) later.

---

## Project Governance and Funding

* The initial development organization, PM Privacy Matters LTD, is responsible for financing work related to the project's development, including software development, infrastructure, and awareness initiatives. PM will adhere to all applicable laws in relevant jurisdictions, such as embargoes and other trade sanctions.
* ExchangeCoin contractors consist of individuals and corporations working on the project under an agreement that provides compensation for their work. ExchangeCoin contractors operate independently and cannot be directly managed by stakeholders. Through Politeia, stakeholders can approve or reject work programs carried out by specific contractors, but they cannot mandate that workers take specific actions.
* The ultimate decision-making authority for the project lies with the stakeholders, as expressed through their on-chain voting.

