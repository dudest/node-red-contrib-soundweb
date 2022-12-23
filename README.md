# node-red-contrib-soundweb
A collection of nodes for controlling BSS Soundweb devices.

---

# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/en/) v18.12.1 or newer
- [Node-RED](https://nodered.org) v3.0.1 or newer
*untested on earlier versions*

## Installation

Install via Node-RED Manage Palette

`node-red-contrib-soundweb`

Install via npm

```
$ cd ~/.node-red
$ npm install node-red-contrib-soundweb
# then restart node-red
```

---

## Resources

- [Soundweb London DI Kit](https://bssaudio.com/en/site_elements/soundweb-london-di-kit)
- [Soundweb London 3rd Party Control](https://help.harmanpro.com/Documents/135/Soundweb%20London%203rd%20Party%20Control.pdf)

# USAGE

## Server Property

**IP address** and **port** of BSS device.

## Address Property

All nodes except the `soundweb-Preset` node require an address be specifie. The address property is a buffer of exactly 8 bytes. it is comprised of:

- Node Address (2 bytes)
- Virtual Device (1 byte)
- Object ID (3 bytes)
- Parameter ID (2 bytes)

The following bytes have special meanings.The node suite will automatically handle replacement when commands are encapsulated and decapsulated. Be mindfull on nodes requiring an address property that the **non replaced** character is needed in decimal format. 

| TYPE   | HEX  | DEC  | HEX replacement | DEC replacement |
| ------ |:----:| :---:| :-------------: | :-------------: |
| STX    | 0x02 | 2    | 0x1B, 0x82      | 27, 130         |
| ETX    | 0x03 | 3    | 0x1B, 0x83      | 27, 131         |
| ACK    | 0x06 | 6    | 0x1B, 0x86      | 27, 134         |
| NAK    | 0x15 | 21   | 0x1B, 0x95      | 27, 149         |
| Escape | 0x1B | 27   | 0x1B, 0x9B      | 27, 155         |

---

# Examples

---

# TODO

- [x] **bss_lib :** *helper library for command encapsulation and decapsulation* 
- [x] **soundweb-server :** *server node*
- [ ] **soundweb-LevelControl :** *Level control node* 
- [ ] **soundweb-StateControl :** *state control node* 
- [ ] **soundweb-Preset :** *preset recall node*
- [ ] **Readme :** *complete documentation*
- [ ] **Unit Testing :** *write comprehensive unit tests*
