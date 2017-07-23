# Toast For Managers 

<img style="margin: 0 auto; text-align: center; width: 300px;" src="./src/img/toast_for_managers.png"/>

<!-- 
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/fact/header._TTH_.png" />
-->

## What does this Alexa app do? 
* Restaurants can set up their Toast for Managers account by registering their Toast API key with their alexa.
* Manager accounts can ask Alexa about their sales and recent business performance by issuing Alexa a list of 
predefined commands.

## Ok, so how do I interact with Toast For Managers?

*  "Alexa, ask Toast for Managers for my sales for today.
*  "Alexa, ask Toast for Managers for my orders yesterday.
*  "Alexa, ask Toast for Managers for my time entries on July 15 2017. 

<b><i>Alexa will respond to these requests with responses like these:</i></b>

*  "On July 15 2017, there were 25 orders and 45 checks for a total amount of $1,467.65. (Say another command, or say help for a list of example questions)
*  "On July 15 2017, 14 employees reported 11 total overtime hours with an average of 5.3 regular hours worked each"
<!-- TODO: Add more example responses -->

## Future Work:

* Ability to drill down further (verbally) into metrics and details.

### Dev Notes

Installing App Dependencies:
```
cd src/ 
npm install
```
Prepare for aws submission (run zip command from /src): 
```
 zip -r -X ../src.zip *
```
