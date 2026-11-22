const county = 'https://hcfl.gov/residents/property-owners-and-renters/trash-and-recycling/';
export const sources = {
  batteries: county + 'discarding-batteries',
  electronics: county + 'discarding-paint-and-electronics',
  special: county + 'discarding-household-hazardous-waste',
  epa: 'https://www.epa.gov/recycle/frequent-questions-lithium-ion-batteries',
  retailer: 'https://www.batteriesplus.com/blog/power/battery-and-light-bulb-recycling',
  staples: 'https://www.staples.com/stores/recycling',
  bestBuy: 'https://www.bestbuy.com/site/services/recycling/pcmcat149900050025.c',
  locator: 'https://locator.batterynetwork.org/',
  ebike: 'https://batterynetwork.org/battery-basics/what-to-recycle/e-bike-batteries/'
};

export const groups = {
  'Loose batteries': {
    household:'Standard household battery (AA/AAA/C/D/9V)', rechargeable:'Rechargeable battery or tool pack',
    primary:'Disposable lithium battery', button:'Button or coin cell', starter:'Lead-acid vehicle battery', ebike:'E-bike battery', unknownBattery:'Battery type unsure'
  },
  'Portable electronics': {phone:'Phone',tablet:'Tablet',watch:'Smartwatch',laptop:'Laptop',power:'Power bank',headphones:'Headphones or earbuds',camera:'Digital camera'},
  'Computers and office': {desktop:'Desktop computer',monitor:'Monitor',peripherals:'Keyboard or mouse',router:'Router',printer:'Printer',scanner:'Document scanner',cable:'Plug-in charger or cable'},
  'Home and gaming': {tv:'TV',speaker:'Speaker or soundbar',console:'Game console',controller:'Game controller'},
  'Other': {unsure:'Other item or unsure'}
};
export const labels = Object.assign({},...Object.values(groups));
export const conditions = {intact:'Intact and cool',damaged:'Damaged',swollen:'Swollen',leaking:'Leaking',hot:'Hot, smoking or burning',unsure:'Condition unsure'};

const countyBatteryTypes = ['rechargeable','primary','starter'];
const countyDeviceTypes = ['phone','tablet','watch','laptop','desktop','monitor','peripherals','router','printer','tv'];
const countyFacilities = [
  ['Northwest County', '8001 W. Linebaugh Ave., Tampa, FL 33625',28.04102,-82.57620],
  ['Hillsborough Heights','6209 County Road 579, Seffner, FL 33584',28.01273,-82.30363,'Third Saturday'],
  ['South County','13000 U.S. Highway 41, Gibsonton, FL 33534',27.80016,-82.38554,'Second Saturday'],
  ['Alderman’s Ford','9402 County Road 39, Plant City, FL 33567',27.87128,-82.14066],
  ['Wimauma','16180 West Lake Drive, Wimauma, FL 33598',27.73320,-82.32357],
  ['Sheldon Road','9805 Sheldon Road, Tampa, FL 33635',28.03848,-82.58526,'First Saturday']
];
const countySites = countyFacilities.map(([name,address,lat,lng,event]) => {
  const eventOnly = name === 'Sheldon Road';
  return {
    name: name + (eventOnly ? ' HHW Collection' : ' Collection Center'), address,lat,lng,
    types:eventOnly ? countyBatteryTypes : [...countyBatteryTypes,...countyDeviceTypes],
    county:true, hours:eventOnly ? event + ' each month, 8 am–2 pm' : 'Monday–Saturday, 7:30 am–5 pm',
    event:eventOnly ? undefined : event, phone:'813-272-5680'
  };
});
const electronicsShops = [
  ['Best Buy · South Tampa','1725 N. Dale Mabry Hwy., Tampa, FL 33607',27.957347,-82.505600,['headphones','speaker','cable'],sources.bestBuy],
  ['Best Buy · Citrus Park','12675 Citrus Plaza Dr., Tampa, FL 33625',28.063978,-82.574927,['headphones','speaker','cable'],sources.bestBuy],
  ['Best Buy · New Tampa','18071 Highwoods Preserve Pkwy., Tampa, FL 33647',28.130558,-82.368220,['headphones','speaker','cable'],sources.bestBuy],
  ['Staples · University area','11806 Bruce B. Downs Blvd., Tampa, FL 33612',28.055796,-82.426147,['scanner','camera','console','controller','headphones','cable','household'],sources.staples,'813-558-9025'],
  ['Staples · West Tampa','3702 W. Spruce St., Tampa, FL 33607',27.959382,-82.503216,['scanner','camera','console','controller','headphones','cable'],sources.staples,'813-872-0467'],
  ['Staples · North Dale Mabry','15017 N. Dale Mabry Hwy., Tampa, FL 33618',28.086011,-82.504638,['scanner','camera','console','controller','headphones','cable'],sources.staples,'813-968-1461'],
  ['Batteries Plus · North Tampa','1703 W. Fletcher Ave., Tampa, FL 33612',28.069715,-82.476067,['household','button','rechargeable','starter','cable'],sources.retailer,'813-499-0246'],
  ['Batteries Plus · South Tampa','4506 W. Kennedy Blvd., Tampa, FL 33609',27.944418,-82.520645,['household','button','rechargeable','starter','cable'],sources.retailer,'813-499-0487'],
  ['Batteries Plus · Brandon','1926 W. Brandon Blvd., Brandon, FL 33511',27.938181,-82.316425,['household','button','rechargeable','starter','cable'],sources.retailer,'813-530-2266'],
  ['Posey Power Battery','3101 E. 3rd Ave., Tampa, FL 33605',27.957284,-82.425248,['household','button','rechargeable','starter','primary'],'https://poseypowerbatteries.com/?page_id=614','813-621-6402'],
  ['Square Deal Battery','3512 N. Florida Ave., Tampa, FL 33603',27.976196,-82.459487,['starter'],'https://www.epchc.org/home/showpublisheddocument/3228/639065853819430000','813-223-3303'],
  ['Tampa Bay Battery','1600 E. Busch Blvd., Tampa, FL 33612',28.032654,-82.441523,['starter'],'https://www.epchc.org/home/showpublisheddocument/3228/639065853819430000','813-932-0108'],
  ['Tampa Bay Battery · Dale Mabry','10321 N. Dale Mabry Hwy., Tampa, FL 33618',28.043641,-82.504775,['starter'],'https://www.epchc.org/home/showpublisheddocument/3228/639065853819430000','813-969-3899'],
  ['eCycle Florida','14180 McCormick Dr., Suite L7, Tampa, FL 33626',28.065169,-82.646052,['phone','laptop','tablet','household'],'https://ecycleflorida.com/electronic-disposal-tampa/','813-463-0079'],
  ['eSmart Recycling','5100 Vivian Place, Tampa, FL 33619',27.923879,-82.399691,['phone','laptop','tablet','desktop','cable','starter'],'https://esmartrecycling.com/individual-dropoffs/','813-501-7768']
].map(([name,address,lat,lng,types,source,phone]) => ({name,address,lat,lng,types,source,phone,hours:'Confirm hours with the recycler'}));
const batteryNetworkShops = [
  ["42378","The Home Depot","9941 E Adamo Dr, Tampa, FL 33619",27.946208,-82.340656,"813-664-0042"],
  ["42381","The Home Depot","1524 E Brandon Blvd, Brandon, FL 33511",27.937814,-82.266878,"813-655-3871"],
  ["95432","Lowe's","1515 E Brandon Blvd, Brandon, FL 33511",27.937744,-82.264355,"813-793-9152"],
  ["68882","Lowe's","11375 Causeway Blvd, Brandon, FL 33511",27.923193,-82.320434,"813-684-3008"],
  ["77832","The Home Depot","10151 Bloomingdale Ave, Riverview, FL 33578",27.893714,-82.334228,"813-246-5714"],
  ["79841","Lowe's","10425 Gibsonton Dr, Riverview, FL 33578",27.856993,-82.327431,"813-313-1424"],
  ["68903","Lowe's","6201 Commerce Palms Dr, Tampa, FL 33647",28.115024,-82.378958,"813-558-6760"],
  ["42351","The Home Depot","8815 N Florida Ave, Tampa, FL 33604",28.029917,-82.459427,"813-933-0302"],
  ["42352","The Home Depot","17601 Bruce B Downs Blvd, Tampa, FL 33647",28.129208,-82.36681,"813-971-7791"],
  ["68915","Lowe's","2801 James L Redman Pkwy, Plant City, FL 33566",27.983536,-82.121624,"813-659-4040"],
  ["42350","The Home Depot","1712 N Dale Mabry Hwy, Tampa, FL 33607",27.958682,-82.505696,"813-879-1000"],
  ["91276","Lowe's","12901 N Dale Mabry Hwy, Tampa, FL 33618",28.063838,-82.504248,"813-313-1321"],
  ["181630","uBreakiFix","12819 N Dale Mabry Hwy, Tampa, FL 33618",28.063155,-82.504082,"813-968-8900"],
  ["68918","Lowe's","4210 S Dale Mabry Hwy, Tampa, FL 33611",27.903811,-82.506126,"813-313-5040"],
  ["42349","The Home Depot","16121 N Dale Mabry Hwy, Tampa, FL 33618",28.098372,-82.502312,"813-960-0051"],
  ["42353","The Home Depot","5125 S Dale Mabry Hwy, Tampa, FL 33611",27.889976,-82.506463,"813-835-9565"],
  ["68880","Lowe's","6275 W Waters Ave, Tampa, FL 33634",28.025613,-82.546899,"813-249-6001"],
  ["77831","The Home Depot","32715 Eiland Blvd, Zephyrhills, FL 33545",28.219367,-82.246235,"813-788-1642"],
  ["163400","Lowe's","21500 State Road 54, Lutz, FL 33549",28.191498,-82.465555,"813-345-9020"],
  ["70591","The Home Depot","6730 Memorial Hwy, Tampa, FL 33615",27.995495,-82.580665,"813-888-7111"]
].map(([id,name,address,lat,lng,phone]) => ({
  name,address,lat,lng,phone,types:['rechargeable','phone'],
  source:`https://locator.batterynetwork.org/location/${id}`,
  hours:'Confirm hours with the store'
}));
const ebikeShops = [
  ["206500","AJ's Bikes","1538 Bloomingdale Avenue, Valrico, FL 33596",27.893707,-82.257042,"813-685-2453"],
  ["224259","City Bike Tampa","208 East Cass Street, Tampa, FL 33602",27.95121,-82.460317,"813-225-1777"],
  ["209245","Trek Bikes Tampa South","530 South Macdill Ave, Tampa, FL 33609",27.939503,-82.49327,"813-712-8000"],
  ["210997","REI - Tampa","1152 Assembly Dr, Tampa, FL 33607",27.9533,-82.5044,"813-582-4091"],
  ["209118","Tampa Bay eBikes - Tampa Location","4004 S Macdill Ave, Unit 6, Tampa, FL 33611",27.90554,-82.49349,"727-228-1975"],
  ["206995","Outspokin Tampa","3300 S Dale Mabry Hwy, Tampa, FL 33629",27.915559,-82.50597,"813-831-1414"],
  ["224308","Trek Store Tampa Carrollwood","14309 N Dale Mabry Hwy, Tampa, FL 33618",28.076896,-82.506916,"813-963-5765"],
  ["219510","Tampa Bay eBikes - Service Center","6020 W Chelsea St, Tampa, FL 33634",27.985443,-82.546812,"813-308-9105"]
].map(([id,name,address,lat,lng,phone]) => ({
  name,address,lat,lng,phone,types:['ebike'],
  source:`https://locator.batterynetwork.org/location/${id}`,
  hours:'Confirm hours with the shop'
}));
const directory = [...countySites,...electronicsShops,...batteryNetworkShops,...ebikeShops];
export const zipCenters = {
  Tampa:[27.9506,-82.4572], '33602':[27.956,-82.459], '33607':[27.969,-82.504],
  '33612':[28.051,-82.447], '33620':[28.060,-82.412], '33625':[28.072,-82.561],
  '33511':[27.919,-82.291], '33534':[27.825,-82.376], '33584':[28.001,-82.285]
};

function distance(lat,lng,site) {
  const rad = Math.PI / 180;
  const a = Math.sin((site.lat-lat)*rad/2)**2 + Math.cos(lat*rad)*Math.cos(site.lat*rad)*Math.sin((site.lng-lng)*rad/2)**2;
  return 3959 * 2 * Math.asin(Math.min(1,Math.sqrt(a)));
}
export function locations(type,condition,[lat,lng]) {
  if (condition !== 'intact') return [];
  return directory.filter(site => site.types.includes(type) || (type === 'power' && site.county && site.types.includes('phone')))
    .map(({types,county,...site}) => {
      const callFirst = (type === 'household' && (site.source === sources.retailer || site.name === 'eCycle Florida')) || type === 'ebike' || type === 'power' || site.name === 'Tampa Bay Battery · Dale Mabry';
      const notes = type === 'power' ? 'Call the county to confirm whole power bank acceptance before travel.'
        : type === 'ebike' ? 'Call the shop to confirm it accepts your e-bike battery brand and model.'
        : type === 'household' && site.source === sources.staples ? 'Staples lists single-use battery recycling for USD 2.99 per visit.'
        : type === 'household' && (site.source === sources.retailer || site.name === 'eCycle Florida') ? 'Call to confirm walk-in alkaline battery recycling, fees and limits.'
        : callFirst ? 'Call this branch to confirm that it still accepts lead-acid drop-offs.'
        : county ? 'Hillsborough County residents only. Bring a state-issued photo ID with a county address.'
        : 'Confirm your exact item, store limits, fees and hours before visiting.';
      const limit = county && countyBatteryTypes.includes(type) && type !== 'starter' ? ' Loose batteries and tool packs are limited to 12 inches.'
        : county && countyDeviceTypes.includes(type) && !['monitor','peripherals','router'].includes(type) ? ' Limit five intact household electronics per month.' : '';
      return {...site,callFirst,notes:notes + limit,miles:distance(lat,lng,site),
        event:countyBatteryTypes.includes(type) ? site.event : undefined,
        source:(type === 'household' && site.name === 'eCycle Florida' ? 'https://ecycleflorida.com/battery-recycling-in-pinellas-county/' : site.source) ?? (countyBatteryTypes.includes(type) || type === 'power' ? sources.batteries : sources.electronics)};
    }).filter(site => site.miles <= 45).sort((a,b) => a.miles - b.miles);
}

function countyPhoneStatus(now) {
  const format = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',hourCycle:'h23'});
  const parts = Object.fromEntries(format.formatToParts(now).map(part => [part.type,part.value]));
  const weekdays = ['Mon','Tue','Wed','Thu','Fri'];
  const index = weekdays.indexOf(parts.weekday);
  const hour = Number(parts.hour);
  if (index >= 0 && hour >= 8 && hour < 17) return 'Open by regular hours until 5 pm Tampa time. Holiday hours may vary.';
  const nextDay = index === -1 || index === 4 && hour >= 17 ? 'Monday' : hour < 8 ? 'today' : ['Tuesday','Wednesday','Thursday','Friday'][index];
  return 'Closed by regular hours. Next scheduled opening is ' + nextDay + ' at 8 am Tampa time. Holiday hours may vary.';
}

export function advice(type,condition,now = new Date()) {
  if (condition === 'hot') return {title:'Move away from the item',severity:'urgent',source:sources.epa,steps:[
    'If there is smoke, fire, or an immediate fire risk, get to safety and call 911.',
    'Avoid handling or transporting the item. For unusual heat without smoke or fire, seek guidance from local fire authorities.'
  ]};
  if (condition !== 'intact') return {title:'Get handling instructions first',severity:'warning',source:sources.special,
    phone:'813-272-5680',phoneStatus:countyPhoneStatus(now),steps:[
      'If there is smoke, fire, or immediate fire risk, move away and call 911.',
      'Stop using or charging the item. Leave an embedded battery in place and avoid opening, squeezing or puncturing it.',
      'Keep a damaged battery out of ordinary collection boxes, household trash and curbside recycling.',
      'Call county Solid Waste or the manufacturer before moving it. Ask about safe handling, transport and an accepting location for your exact item and condition.'
    ]};
  if (['unsure','unknownBattery'].includes(type)) return {title:'Identify the item before disposal',source:sources.batteries,steps:[
    'Check the printed label or model number, or ask the manufacturer. Keep it out of curbside recycling while you confirm the type.'
  ]};
  if (type === 'household') return {title:'Check the label and take-back options',source:sources.batteries,locator:sources.locator,steps:[
    'AA and AAA describe size. Select the rechargeable or disposable lithium category if the label identifies that type.',
    'Hillsborough County directs residents to put confirmed alkaline batteries in the garbage cart. The retailer listings are recycling options to confirm by phone.'
  ]};
  if (type === 'power') return {title:'Recycle the power bank whole',source:sources.epa,phone:'813-272-5680',phoneStatus:countyPhoneStatus(now),steps:[
    'Keep the power bank intact and out of household trash and curbside recycling.',
    'Ask Hillsborough County if a listed center can take the whole power bank before traveling.'
  ]};
  if (type === 'ebike') return {title:'Use a dedicated e-bike battery drop-off',source:sources.ebike,locator:sources.locator,steps:[
    'Keep the battery out of household trash, curbside recycling and ordinary battery collection bins.',
    'Call the shop with the battery brand and model before visiting. The program covers participating brands, and each shop confirms what it can accept.'
  ]};
  if (type === 'starter') return {title:'Recycle the lead-acid battery',source:sources.batteries,
    alternative:{label:'TurnKey Battery mobile recycling and bulk pickup inquiries',url:'https://turnkeybattery.com/battery-recycling/'},steps:[
    'Ask the collector about handling and size restrictions before bringing it. EV packs and large lithium packs need specialized disposal.'
  ]};
  if (['rechargeable','primary','button'].includes(type)) return {title:'Use a suitable battery collector',source:sources.batteries,locator:sources.locator,
    ...(type === 'primary' ? {} : {alternative:{label:'Read Florida Statutes § 403.7192',url:'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0403/Sections/0403.7192.html'}}),steps:[
    ...(type === 'rechargeable' ? [
      'Florida law prohibits knowingly putting covered nonvehicle rechargeable nickel-cadmium (NiCd) or sealed lead-acid batteries or packs under 25 lb, or products containing them, in mixed trash. Batteries used for memory backup are outside this definition.',
      'For covered batteries, ask the manufacturer or marketer for its designated return location. Leave built-in batteries in place.'
    ] : type === 'button' ? [
      'Florida law prohibits knowingly putting dry cells with a mercuric oxide electrode, or products containing them, in mixed trash. If the label identifies mercuric oxide, ask the manufacturer or distributor for its designated return location.'
    ] : []),
    'Keep these batteries out of household trash and curbside recycling. Follow the collector’s instructions for protecting terminals with nonconductive tape or individual bags.',
    'Confirm that the location takes the exact type and size before visiting.'
  ]};
  const dataDevice = ['phone','tablet','watch','laptop','desktop','router','console','camera'].includes(type);
  return {title:'Take it to electronics recycling',source:countyDeviceTypes.includes(type) ? sources.electronics : type === 'headphones' || type === 'speaker' ? sources.bestBuy : sources.staples,steps:[
    'Keep the device intact and out of curbside recycling. Leave built-in batteries in place.',
    ...(dataDevice ? ['Back up files you want to keep and clear personal information or saved settings when safe and feasible.'] : []),
    'Check the collector’s item limits and hours before visiting.'
  ]};
}
