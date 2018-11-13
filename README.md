# Swisscom Blockchain Network

> Example business network that shows Swisscom  and Customers defining contracts for the price of a sim card, which swisscom ships
to customers and give "free credits" for everyday of delay (if any). 

The business network defines a contract as: 
The contract stipulates that: On receipt of the Sim card the customer pays Swisscom the unit price 30 CHF.
Swisscom gives 1CHF as free credits in any case. 

Sim cards that arrive late are gets free credits (10 CHF credits per day).
The free credits apply automatically using a smart contract. 
Moreover, the customer and Swisscom are able to see the location of the sim card at anytime (considering that adiqute means  from DHL or Swiss post are provided) 

This business network defines:

**Participants**
`Company` `Customer`

**Assets**
`Contract` `SimCard`

**Transactions**
`LocationReading` `ShipmentReceived` `SetupDemo`

To test this Business Network: 
**Step 1**: head to https://composer-playground.mybluemix.net/ 


**Step 2**: Replace all the code in the **Define** tab with the code in this repository 

**Step 3**: Submit a `SetupDemo` transaction:

```
{
  "$class": "ch.swisscom.blockchain.SetupDemo"
}
```

This transaction populates the Participant Registries with a `Customer`, an `Company` (will be named Swisscom) . The Asset Registries will have a `Contract` asset and a `SimCard` asset.

*Optional*
Submit a `LocationReading` transaction:

```
{
  "$class": "ch.swisscom.blockchain.LocationReading",
  "location": "Bern",
  "shipment": "resource:ch.swisscom.blockchain.SimCard#sim_001"
}
```

//to do : calculate the number of days correctly 

Submit a `ShipmentReceived` transaction for `sim_001` to trigger the payout to Swisscom, based on the parameters of the `CON_001` contract:

```
{
  "$class": "ch.swisscom.blockchain.ShipmentReceived",
  "shipment": "resource:ch.swisscom.blockchain.SimCardt#sim_001"
}
```

If the date-time of the `ShipmentReceived` transaction is after the `arrivalDateTime` on `CON_001` then Swisscom will 
give 10 CHF as free credits to the customer of `sim_001`

