## BxlContact

<img src="https://raw.githubusercontent.com/ELEC-H417-Group/BxlContact/main/public/images/logo2.png" width="300" >

[BxlContact](http://chat.yiywang.tech) chat software is a web chat tool based on [nodejs](https://nodejs.org/)+[express](https://expressjs.com/)+[websocket](https://www.npmjs.com/package/websocket) module.   
The front end uses ejs as the template engine. The server uses express to build a web service, and ws to create a server websocket service, which realizes the functions of login and registration, one-to-one chat and private chat (end-to-end encryption).

[![Live Demo](https://camo.githubusercontent.com/4a28be9123410257788f557f35fa0952906e882eee2289501b163226e6f82422/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f64656d6f2d6f6e6c696e652d677265656e2e737667)](http://chat.yiywang.tech) 


## Features

[✔]Support one-to-one messaging :clap:

[✔]Support end-to-end encryption :lock:

[✔]Support online user statistics and user list :green_book:

[✔]Message notification :alarm_clock:

[✔]Keyboard support :musical_keyboard:

[✔]Support for mobile phone, tablet and PC :iphone: :computer:

## Install

This project uses node and npm. Go check them out if you don't have them locally installed.  

Enter the BxlContact main folder through the terminal and run:

``` 
$ npm install --global 
```   

OR  

If it fails, you can check the dependency list in the [package-lock.json]() file and install them one by one

## Usage

When you have completed the install step, enter the home directory and use the command:

``` 
$ npm start
```   

If the server run successfully, you can enter the following address in your browser: 

``` 
http://localhost:3000/
```   


<img src="https://raw.githubusercontent.com/ELEC-H417-Group/BxlContact/main/public/images/fig1.png" width="300" >

<img src="https://raw.githubusercontent.com/ELEC-H417-Group/BxlContact/main/public/images/fig2.png" width="300" >


## Cannot Start the Server? 

1. re-install the dependency and restart
2. check the port of your computer, 3000 and 9876, whether are open
3. check the node.js version, use the stable version of node.js
4. If none of these can solve your problem, you can log in to our [demo website](http://chat.yiywang.tech) to view the function

## MySQL Database

If you want to build a similar database on your computer or server through this project, you can use the following code:
```
CREATE TABLE `bxlcontact`.`user`(
`username` VARCHAR(100) NOT NULL,
`password` VARCHAR(100) NOT NULL,
PRIMARY KEY (`username`)
) ENGINE=MYISAM CHARSET=utf8 COLLATE=utf8_general_ci;



CREATE TABLE `bxlcontact`.`content`( 
`id` INT(100) NOT NULL AUTO_INCREMENT, 
`from` VARCHAR(100) NOT NULL,
`to` VARCHAR(100) NOT NULL, 
`content` VARCHAR(1000) NOT NULL, 
`time` DATETIME(6) NOT NULL, PRIMARY KEY (`id`) 
) ENGINE=MYISAM CHARSET=utf8 COLLATE=utf8_general_ci;  

```


## Video Instruction

[![Watch the video](https://raw.githubusercontent.com/ELEC-H417-Group/BxlContact/main/public/images/video.png)](https://www.youtube.com/watch?v=x-xJ9w3VdyA)
