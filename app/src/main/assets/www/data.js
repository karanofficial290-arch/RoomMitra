/* ✏️ अपना सपोर्ट ईमेल यहाँ लिखें */
window.RM_SUPPORT_EMAIL = 'apna-email@gmail.com';

/* डेटा वर्ज़न – इसे बदलने पर पुराने फोन का डेमो डेटा (चैट, पसंदीदा) रीसेट हो जाता है */
window.RM_DATA_VERSION = 2;
window.RM_REGION = 'Himachal Pradesh';

/* RoomMitra – हिमाचल के शहर */
window.RM_CITIES = [
  {id:'Nahan', hi:'नाहन', img:'img/c_nahan.svg', areas:['Kacha Tank','Pucca Tank','Gunnughat','Villa Round','Chaugan','Bus Stand Nahan','Rani Tal','Shambhuwala','Medical College Road']},
  {id:'Paonta Sahib', hi:'पांवटा साहिब', img:'img/c_paonta.svg', areas:['Gurudwara Road','Main Bazaar','Badripur Chowk','Devinagar','Bata Mandi','Puruwala','Majra','Gondpur','Industrial Area']},
  {id:'Shimla', hi:'शिमला', img:'img/c_shimla.svg', areas:['Sanjauli','Chhota Shimla','Kasumpti','Panthaghati','New Shimla','Summer Hill','Boileauganj','Totu','Dhalli','Lakkar Bazaar','Tara Devi']},
  {id:'Solan', hi:'सोलन', img:'img/c_solan.svg', areas:['Saproon','Chambaghat','Rajgarh Road','Shamti','Deonghat','Kotlanala','Kathed','Mall Road Solan','Oachghat']}
];

window.RM_AREA_HI = {
  'Kacha Tank':'कच्चा टैंक','Pucca Tank':'पक्का टैंक','Gunnughat':'गुन्नूघाट','Villa Round':'विला राउंड','Chaugan':'चौगान',
  'Bus Stand Nahan':'बस स्टैंड नाहन','Rani Tal':'रानी ताल','Shambhuwala':'शंभूवाला','Medical College Road':'मेडिकल कॉलेज रोड',
  'Gurudwara Road':'गुरुद्वारा रोड','Main Bazaar':'मेन बाज़ार','Badripur Chowk':'बद्रीपुर चौक','Devinagar':'देवीनगर','Bata Mandi':'बाता मंडी',
  'Puruwala':'पुरूवाला','Majra':'माजरा','Gondpur':'गोंदपुर','Industrial Area':'इंडस्ट्रियल एरिया',
  'Sanjauli':'संजौली','Chhota Shimla':'छोटा शिमला','Kasumpti':'कसुम्पटी','Panthaghati':'पंथाघाटी','New Shimla':'न्यू शिमला',
  'Summer Hill':'समर हिल','Boileauganj':'बालूगंज','Totu':'टूटू','Dhalli':'ढली','Lakkar Bazaar':'लक्कड़ बाज़ार','Tara Devi':'तारा देवी',
  'Saproon':'सपरून','Chambaghat':'चंबाघाट','Rajgarh Road':'राजगढ़ रोड','Shamti':'शामती','Deonghat':'देऊंघाट','Kotlanala':'कोटलानाला',
  'Kathed':'कथेड़','Mall Road Solan':'माल रोड सोलन','Oachghat':'ओच्छघाट'
};

window.RM_AMENITIES = [
  {id:'wifi', hi:'वाई-फाई', en:'WiFi', ic:'wifi'},
  {id:'geyser', hi:'गीज़र', en:'Geyser', ic:'geyser'},
  {id:'heater', hi:'हीटर', en:'Heater', ic:'flame'},
  {id:'bed', hi:'बेड', en:'Bed', ic:'bed'},
  {id:'wardrobe', hi:'अलमारी', en:'Wardrobe', ic:'wardrobe'},
  {id:'water', hi:'पानी 24x7', en:'Water', ic:'drop'},
  {id:'parking', hi:'पार्किंग', en:'Parking', ic:'car'},
  {id:'power', hi:'बिजली', en:'Electricity', ic:'bolt'},
  {id:'view', hi:'माउंटेन व्यू', en:'Hill View', ic:'mountain'},
  {id:'balcony', hi:'बालकनी', en:'Balcony', ic:'balcony'},
  {id:'food', hi:'खाना', en:'Food', ic:'food'},
  {id:'kitchen', hi:'किचन', en:'Kitchen', ic:'kitchen'},
  {id:'ac', hi:'AC/कूलर', en:'AC/Cooler', ic:'ac'},
  {id:'tv', hi:'TV', en:'TV', ic:'tv'},
  {id:'lift', hi:'लिफ्ट', en:'Lift', ic:'lift'}
];

const O = (name, phone, rating, reviews, since) => ({name, phone, rating, reviews, since});

window.RM_SEED = [
  /* ---------- नाहन ---------- */
  {id:'L1', title:'2BHK फ्लैट (सेमी फर्निश्ड)', kind:'2BHK', ptype:'flat', city:'Nahan', area:'Villa Round', price:9500,
   rooms:2, baths:2, sqft:850, floor:'1st Floor', furnish:'सेमी फर्निश्ड',
   desc:'नाहन के विला राउंड में शांत लोकेशन पर 2BHK फ्लैट। धूप वाला घर, सामने पहाड़ों का सुंदर नज़ारा। चौगान मैदान और बाज़ार 10 मिनट पैदल। परिवार के लिए बेहतरीन।',
   amen:['geyser','water','parking','view','balcony','kitchen','wardrobe'], tags:['माउंटेन व्यू','परिवार के लिए'],
   imgs:['img/room1.jpg','img/room7.jpg','img/bath.jpg','img/kitchen.jpg','img/balcony.jpg'],
   owner:O('Rajesh Thakur','9816012345',4.8,28,'2 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, views:126},
  {id:'L2', title:'सिंगल रूम (स्टूडेंट्स के लिए)', kind:'Room', ptype:'room', city:'Nahan', area:'Medical College Road', price:3500,
   rooms:1, baths:1, sqft:180, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'डॉ. वाई.एस. परमार मेडिकल कॉलेज के पास साफ-सुथरा सिंगल रूम। बेड, टेबल, अलमारी, गीज़र और वाई-फाई। MBBS और नर्सिंग स्टूडेंट्स के लिए बेहतर।',
   amen:['wifi','geyser','bed','wardrobe','water','power'], tags:['छात्रों के लिए बेहतर'],
   imgs:['img/room2.jpg','img/room1.jpg','img/bath.jpg'],
   owner:O('Sunil Chauhan','9418023456',4.6,19,'3+ साल का अनुभव'), verified:true, direct:true, now:true, featured:true, single:true, views:88},
  {id:'L3', title:'PG (लड़कियों के लिए)', kind:'PG', ptype:'pg', city:'Nahan', area:'Kacha Tank', price:4500, gender:'girls', sharing:true,
   rooms:1, baths:1, sqft:220, floor:'1st Floor', furnish:'फर्निश्ड',
   desc:'कच्चा टैंक में लड़कियों के लिए सुरक्षित PG। घर जैसा खाना (दो टाइम), गीज़र, वाई-फाई, CCTV। बस स्टैंड और कॉलेज पास में।',
   amen:['wifi','food','geyser','bed','water','power','wardrobe'], tags:['लड़कियों के लिए','खाना शामिल'],
   imgs:['img/room4.jpg','img/room2.jpg','img/bath.jpg'],
   owner:O('Kamla Devi','9816098765',4.9,37,'5 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, safeWomen:true, views:97},
  {id:'L4', title:'1RK रूम (किचन के साथ)', kind:'1RK', ptype:'room', city:'Nahan', area:'Gunnughat', price:4000,
   rooms:1, baths:1, sqft:300, floor:'Ground Floor', furnish:'सेमी फर्निश्ड',
   desc:'गुन्नूघाट में 1RK रूम, अलग किचन और अटैच्ड बाथरूम। नौकरीपेशा या कपल के लिए उपयुक्त। बाज़ार नज़दीक।',
   amen:['kitchen','geyser','water','power'], tags:['सेमी फर्निश्ड'],
   imgs:['img/room5.jpg','img/kitchen.jpg','img/bath.jpg'],
   owner:O('Vinod Sharma','9418034567',4.3,12,'1 साल से सक्रिय'), verified:true, direct:true, now:true, views:47},
  {id:'L5', title:'PG (लड़कों के लिए)', kind:'PG', ptype:'pg', city:'Nahan', area:'Bus Stand Nahan', price:4200, gender:'boys', sharing:true,
   rooms:1, baths:1, sqft:400, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'बस स्टैंड नाहन के पास लड़कों का PG। खाना, वाई-फाई, गीज़र। ITI और कॉलेज स्टूडेंट्स के लिए बजट विकल्प।',
   amen:['wifi','food','geyser','bed','water','power'], tags:['PG','सिर्फ लड़कों के लिए'],
   imgs:['img/room4.jpg','img/room5.jpg'],
   owner:O('Ramesh Kanwar','9816045678',4.4,22,'4 साल से सक्रिय'), verified:false, direct:true, now:true, views:64},

  /* ---------- पांवटा साहिब ---------- */
  {id:'L6', title:'2BHK फ्लैट (फर्निश्ड)', kind:'2BHK', ptype:'flat', city:'Paonta Sahib', area:'Badripur Chowk', price:11000,
   rooms:2, baths:2, sqft:950, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'बद्रीपुर चौक पर फर्निश्ड 2BHK। मॉड्यूलर किचन, कूलर, पार्किंग। इंडस्ट्रियल एरिया की कंपनियों में काम करने वालों के लिए बढ़िया।',
   amen:['ac','kitchen','balcony','parking','wardrobe','water','power','geyser'], tags:['फर्निश्ड','पार्किंग'],
   imgs:['img/room6.jpg','img/kitchen.jpg','img/balcony.jpg','img/bath.jpg'],
   owner:O('Gurpreet Singh','9805056789',4.7,24,'3 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, views:203},
  {id:'L7', title:'सिंगल रूम (वर्किंग के लिए)', kind:'Room', ptype:'room', city:'Paonta Sahib', area:'Gondpur', price:3800,
   rooms:1, baths:1, sqft:200, floor:'1st Floor', furnish:'फर्निश्ड',
   desc:'गोंदपुर में फैक्ट्री/कंपनी कर्मचारियों के लिए सिंगल रूम। बिजली-पानी शामिल, कूलर और बेड।',
   amen:['bed','ac','water','power','parking'], tags:['बिजली-पानी शामिल'],
   imgs:['img/room3.jpg','img/bath.jpg'],
   owner:O('Harjeet Kaur','9805067890',4.5,15,'2 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, single:true, views:58},
  {id:'L8', title:'1BHK फ्लैट (सेमी फर्निश्ड)', kind:'1BHK', ptype:'flat', city:'Paonta Sahib', area:'Gurudwara Road', price:7000,
   rooms:1, baths:1, sqft:550, floor:'1st Floor', furnish:'सेमी फर्निश्ड',
   desc:'गुरुद्वारा पांवटा साहिब के पास 1BHK, यमुना की तरफ खुली जगह। बाज़ार पैदल दूरी पर।',
   amen:['kitchen','balcony','water','power','geyser'], tags:['सेमी फर्निश्ड','बाज़ार पास'],
   imgs:['img/room7.jpg','img/kitchen.jpg','img/balcony.jpg'],
   owner:O('Manjit Singh','9816078901',4.6,11,'1 साल से सक्रिय'), verified:true, direct:false, now:true, views:39},
  {id:'L9', title:'PG (लड़कों के लिए)', kind:'PG', ptype:'pg', city:'Paonta Sahib', area:'Devinagar', price:5000, gender:'boys', sharing:true,
   rooms:1, baths:1, sqft:500, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'देवीनगर में खाने के साथ PG। वाई-फाई, वॉशिंग मशीन, 24x7 पानी। कॉलेज और इंडस्ट्रियल एरिया दोनों पास।',
   amen:['wifi','food','bed','water','power','wardrobe'], tags:['खाना शामिल'],
   imgs:['img/room4.jpg','img/room2.jpg'],
   owner:O('Ajay Rana','9418089012',4.2,9,'1 साल से सक्रिय'), verified:false, direct:true, now:true, views:25},

  /* ---------- शिमला ---------- */
  {id:'L10', title:'1BHK फ्लैट (माउंटेन व्यू)', kind:'1BHK', ptype:'flat', city:'Shimla', area:'Sanjauli', price:12000,
   rooms:1, baths:1, sqft:600, floor:'3rd Floor', furnish:'फर्निश्ड',
   desc:'संजौली में वैली व्यू वाला फर्निश्ड 1BHK। रूम हीटर, गीज़र, वाई-फाई। HRTC बस स्टॉप 2 मिनट, IGMC 15 मिनट।',
   amen:['wifi','heater','geyser','view','kitchen','water','power','wardrobe'], tags:['वैली व्यू','हीटर'],
   imgs:['img/room1.jpg','img/room6.jpg','img/kitchen.jpg','img/balcony.jpg'],
   owner:O('Anil Negi','9418090123',4.8,31,'4 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, views:180},
  {id:'L11', title:'सिंगल रूम (HPU के पास)', kind:'Room', ptype:'room', city:'Shimla', area:'Summer Hill', price:5500,
   rooms:1, baths:1, sqft:160, floor:'1st Floor', furnish:'फर्निश्ड',
   desc:'समर हिल में हिमाचल प्रदेश यूनिवर्सिटी के पास सिंगल रूम। हीटर, गीज़र और स्टडी टेबल। स्टूडेंट्स के लिए शांत माहौल।',
   amen:['heater','geyser','bed','wifi','water','power'], tags:['छात्रों के लिए बेहतर','HPU पास'],
   imgs:['img/room2.jpg','img/room5.jpg','img/bath.jpg'],
   owner:O('Kiran Verma','9816001234',4.6,26,'3 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, single:true, views:142},
  {id:'L12', title:'2BHK फ्लैट (सेमी फर्निश्ड)', kind:'2BHK', ptype:'flat', city:'Shimla', area:'New Shimla', price:18000,
   rooms:2, baths:2, sqft:1000, floor:'4th Floor', furnish:'सेमी फर्निश्ड',
   desc:'न्यू शिमला सेक्टर में 2BHK, धूप वाली बालकनी और पार्किंग। सरकारी कर्मचारियों और परिवार के लिए उपयुक्त।',
   amen:['geyser','heater','parking','balcony','view','kitchen','water','power'], tags:['पार्किंग','धूप वाला'],
   imgs:['img/room6.jpg','img/kitchen.jpg','img/balcony.jpg','img/bath.jpg'],
   owner:O('Sanjay Chauhan','9418012345',4.7,18,'2 साल से सक्रिय'), verified:true, direct:true, now:false, views:99},
  {id:'L13', title:'PG (लड़कियों के लिए)', kind:'PG', ptype:'pg', city:'Shimla', area:'Chhota Shimla', price:8000, gender:'girls', sharing:true,
   rooms:1, baths:1, sqft:250, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'छोटा शिमला में लड़कियों के लिए सुरक्षित PG। तीनों टाइम खाना, हीटर, गीज़र। सचिवालय और कॉलेज पास।',
   amen:['wifi','food','heater','geyser','bed','water','power'], tags:['लड़कियों के लिए','खाना शामिल'],
   imgs:['img/room4.jpg','img/room2.jpg','img/bath.jpg'],
   owner:O('Sunita Thakur','9816023456',4.9,40,'6 साल से सक्रिय'), verified:true, direct:true, now:true, safeWomen:true, views:121},
  {id:'L14', title:'1RK रूम', kind:'1RK', ptype:'room', city:'Shimla', area:'Totu', price:6500,
   rooms:1, baths:1, sqft:280, floor:'Ground Floor', furnish:'सेमी फर्निश्ड',
   desc:'टूटू में बजट 1RK, किचन और बाथरूम के साथ। बस रूट पर, बालूगंज 10 मिनट।',
   amen:['kitchen','geyser','water','power'], tags:['बजट'],
   imgs:['img/room5.jpg','img/kitchen.jpg'],
   owner:O('Prem Lal','9418034561',4.1,7,'1 साल से सक्रिय'), verified:false, direct:true, now:true, views:30},

  /* ---------- सोलन ---------- */
  {id:'L15', title:'सिंगल रूम (यूनिवर्सिटी स्टूडेंट्स)', kind:'Room', ptype:'room', city:'Solan', area:'Saproon', price:5000,
   rooms:1, baths:1, sqft:200, floor:'1st Floor', furnish:'फर्निश्ड',
   desc:'सपरून में सिंगल रूम, अटैच्ड बाथरूम। यूनिवर्सिटी बस और लोकल बस दोनों का स्टॉप पास में। गीज़र, वाई-फाई, स्टडी टेबल।',
   amen:['wifi','geyser','bed','wardrobe','water','power'], tags:['छात्रों के लिए बेहतर'],
   imgs:['img/room3.jpg','img/bath.jpg','img/room1.jpg'],
   owner:O('Deepak Thakur','9816034567',4.7,29,'3 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, single:true, views:133},
  {id:'L16', title:'2BHK फ्लैट (फर्निश्ड)', kind:'2BHK', ptype:'flat', city:'Solan', area:'Chambaghat', price:14000,
   rooms:2, baths:2, sqft:900, floor:'2nd Floor', furnish:'फर्निश्ड',
   desc:'चंबाघाट में NH-5 के पास फर्निश्ड 2BHK। पहाड़ों का नज़ारा, पार्किंग, हीटर। शिमला-चंडीगढ़ आने-जाने वालों के लिए सुविधाजनक।',
   amen:['geyser','heater','parking','view','balcony','kitchen','wifi','water','power'], tags:['फर्निश्ड','माउंटेन व्यू'],
   imgs:['img/room7.jpg','img/room6.jpg','img/kitchen.jpg','img/balcony.jpg'],
   owner:O('Rohit Kashyap','9418045678',4.8,21,'2 साल से सक्रिय'), verified:true, direct:true, now:true, featured:true, views:156},
  {id:'L17', title:'PG (लड़कों के लिए)', kind:'PG', ptype:'pg', city:'Solan', area:'Rajgarh Road', price:6000, gender:'boys', sharing:true,
   rooms:1, baths:1, sqft:450, floor:'1st Floor', furnish:'फर्निश्ड',
   desc:'राजगढ़ रोड पर लड़कों का PG, नौणी यूनिवर्सिटी रूट पर। खाना, वाई-फाई, गीज़र और हीटर।',
   amen:['wifi','food','geyser','heater','bed','water','power'], tags:['खाना शामिल','PG'],
   imgs:['img/room4.jpg','img/room5.jpg'],
   owner:O('Mohan Lal','9816056789',4.4,16,'2 साल से सक्रिय'), verified:true, direct:false, now:true, views:72},
  {id:'L18', title:'1BHK फ्लैट', kind:'1BHK', ptype:'flat', city:'Solan', area:'Shamti', price:9000,
   rooms:1, baths:1, sqft:550, floor:'Ground Floor', furnish:'अनफर्निश्ड',
   desc:'शामती में 1BHK, खुली धूप और छोटा आंगन। शांत रिहायशी इलाका, बाज़ार 5 मिनट गाड़ी से।',
   amen:['kitchen','geyser','parking','water','power','view'], tags:['धूप वाला','पार्किंग'],
   imgs:['img/room1.jpg','img/kitchen.jpg','img/bath.jpg'],
   owner:O('Neelam Sharma','9418067890',4.5,10,'1 साल से सक्रिय'), verified:true, direct:true, now:false, views:41}
];

window.RM_CHATS = [
  {id:'c1', name:'राजेश ठाकुर', role:'मकान मालिक', av:'img/a_rahul.jpg', listing:'L1', unread:2, time:'आज 09:15', phone:'9816012345',
   msgs:[
    {me:false, t:'नमस्ते! आपने जो 2BHK फ्लैट के बारे में पूछा था, वो अभी भी उपलब्ध है। अगर आपको देखना हो तो कल शाम 5 बजे आ सकते हैं।', at:'04:12 PM'},
    {me:true, t:'जी बिल्कुल, मैं कल शाम 5 बजे आ जाऊँगा। कृपया लोकेशन और एड्रेस भी भेज दीजिए।', at:'04:15 PM'},
    {me:false, loc:true, t:'मकान नं. 12, विला राउंड, नाहन (चौगान से ऊपर की तरफ)', at:'04:16 PM'},
    {me:true, t:'ठीक है, धन्यवाद! क्या सर्दियों में गीज़र और धूप ठीक रहती है?', at:'04:18 PM'},
    {me:false, t:'हाँ, दोनों कमरों में दिन भर धूप आती है और गीज़र भी लगा है। मैं आपको कुछ फोटो भेज रहा हूँ।', at:'04:20 PM'},
    {me:true, t:'बहुत बढ़िया! फोटो भेज दीजिए।', at:'04:21 PM'},
    {me:false, pics:['img/room7.jpg','img/room6.jpg','img/kitchen.jpg'], t:'6 फोटो', at:'04:25 PM'},
    {me:false, t:'नमस्ते! आप आज आ रहे हैं न?', at:'09:15 AM'}
   ]},
  {id:'c2', name:'अमित राणा', role:'किरायेदार', av:'img/a_amit.jpg', listing:'L5', unread:1, time:'आज 08:47', phone:'9418089012',
   msgs:[{me:false, t:'क्या यह PG सिर्फ लड़कों के लिए है? खाना कितने टाइम मिलता है?', at:'08:47 AM'}]},
  {id:'c3', name:'प्रियंका नेगी', role:'किरायेदार', av:'img/a_priyanka.jpg', listing:'L13', unread:0, time:'कल 06:32', phone:'9816023456',
   msgs:[{me:false, t:'मैं कल छोटा शिमला देखने आ सकती हूँ। टाइम क्या रहेगा?', at:'06:32 PM'}]},
  {id:'c4', name:'1BHK फ्लैट (सोलन)', role:'', av:'img/room1.jpg', listing:'L18', unread:0, time:'कल 05:20', phone:'9418067890',
   msgs:[{me:false, t:'फ्लैट खाली है, अगले महीने की 1 तारीख से शिफ्ट कर सकते हैं।', at:'05:20 PM'}]},
  {id:'c5', name:'गुरप्रीत सिंह', role:'मकान मालिक', av:'img/a_sandeep.jpg', listing:'L6', unread:0, time:'कल 04:12', phone:'9805056789',
   msgs:[{me:false, t:'पांवटा वाला फ्लैट देखना है तो कॉल कर लेना।', at:'04:12 PM'}]},
  {id:'c6', name:'पूजा ठाकुर', role:'किरायेदार', av:'img/a_pooja.jpg', listing:'L15', unread:0, time:'कल 01:45', phone:'9816034567',
   msgs:[{me:false, t:'क्या इसमें वाई-फाई और गीज़र की सुविधा है?', at:'01:45 PM'}]},
  {id:'c7', name:'PG (लड़कियों के लिए)', role:'', av:'img/room2.jpg', listing:'L3', unread:0, time:'13 अक्टूबर 08:21', phone:'9816098765',
   msgs:[{me:false, t:'मैंने आपकी लिस्टिंग देखी है। क्या अभी भी उपलब्ध है?', at:'08:21 AM'}]}
];
