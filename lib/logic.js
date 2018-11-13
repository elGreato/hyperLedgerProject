

/* global getParticipantRegistry getAssetRegistry getFactory */

/**
 * A Sim Card has been received by a Customer
 * @param {ch.swisscom.blockchain.ShipmentReceived} shipmentReceived - the ShipmentReceived transaction
 * @transaction
 */
async function payOut(shipmentReceived) {  // eslint-disable-line no-unused-vars

    const contract = shipmentReceived.SimCard.contract;
    const simCard = shipmentReceived.SimCard;
    let payOut = contract.unitPrice;

    console.log('Received at: ' + shipmentReceived.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arrivalDateTime);

    // set the status of the shipment
    simCard.status = 'ARRIVED';

    // if the shipment did not arrive on time the payout is zero
    if (shipmentReceived.timestamp > contract.arrivalDateTime) {
        payOut = 0;
      	shipmentReceived.freeCredits= shipmentReceived.timestamp -contract.arrivalDateTime;
        console.log('Late shipment' + 'swisscom customer get '+ shipmentReceived.freeCredits+' free Credits');
    } 
    

    
    // update  Swisscom registery
    const companyRegistry = await getParticipantRegistry('ch.swisscom.blockchain.Company');
    await companyRegistry.update(contract.company);

    // update the cusomter
    const customerRegistry = await getParticipantRegistry('ch.swisscom.blockchain.Customer');
    await customerRegistry.update(contract.customer);

    // update the state of the shipment
    const simCardRegistery = await getAssetRegistry('ch.swisscom.blockchain.SimCard');
    await simCardRegistery.update(simCard);
}

/**
 * A Location reading has been received for a shipment
 * @param {ch.swisscom.blockchain.LocationReading} locationReadings 
 * @transaction
 */
async function locationReading(locationReading) {  // eslint-disable-line no-unused-vars

    const ship = locationReading.location;

    console.log('Adding temperature ' + locationReading.location + ' to shipment ' + ship.$identifier);

    if (ship.locationReadings) {
        ship.locationReadings.push(locationReading);
    } else {
        ship.locationReadings = [locationReading];
    }

    // add the location reading to the shipment
    const shipmentRegistry = await getAssetRegistry('ch.swisscom.blockchain.SimCard');
    await shipmentRegistry.update(ship);
}

/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {ch.swisscom.blockchain.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'ch.swisscom.blockchain';

    // create the Swisscom Copmany
    const company = factory.newResource(NS, 'Company', 'admin@swisscom.ch');
    const companyAddress = factory.newConcept(NS, 'Address');
    companyAddress.country = 'Switzerland';
    company.address = companyAddress;
  

    // create the Customer
    const customer = factory.newResource(NS, 'Customer', 'customer@email.com');
    const customerAddress = factory.newConcept(NS, 'Address');
    customerAddress.country = 'Switzerland';
    customer.address = customerAddress;



    // create the contract
    const contract = factory.newResource(NS, 'Contract', 'CON_001');
    contract.company = factory.newRelationship(NS, 'Company', 'admin@swisscom.ch');
    contract.customer = factory.newRelationship(NS, 'Customer', 'customer@email.com');

    const tomorrow = setupDemo.timestamp;
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.arrivalDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.unitPrice = 30; // pay 30 CHF per sim card

    contract.daysTillSimArrived = 1; // max temperature for the cargo
 	
    contract.creditsPerDay = 5; // Swisscom offers 5CHF per late day as free credits
  
    // create the simcard
    const simCard = factory.newResource(NS, 'SimCard', 'sim_001');
    simCard.type = 'prepaid';
    simCard.status = 'IN_TRANSIT';
  	simCard.freeCredits = 1; //initial 1CHF as a goodwill :) 

    simCard.contract = factory.newRelationship(NS, 'Contract', 'CON_001');

    // add the copmany
    const companyRegistry = await getParticipantRegistry(NS + '.Company');
    await companyRegistry.addAll([company]);

    // add the customer
    const customerRegistry = await getParticipantRegistry(NS + '.Customer');
    await customerRegistry.addAll([customer]);


    // add the contracts
    const contractRegistry = await getAssetRegistry(NS + '.Contract');
    await contractRegistry.addAll([contract]);

    // add the shipments
    const shipmentRegistry = await getAssetRegistry(NS + '.SimCard');
    await shipmentRegistry.addAll([simCard]);
}