export const Suits = {
    CLUB:"CLUB",
    DIAMOND:"DIAMOND",
    HEART:"HEART",
    SPADE:"SPADE",
};
const SHORT_NAMES = {
    c:"CLUB",
    d:"DIAMOND",
    h:"HEART",
    s:"SPADE",
};

export class Card{
    constructor(suit, value) {
        let s;
        if(typeof suit=="string"){
            s=suit.length==1?SHORT_NAMES[suit.toLowerCase()]:Suits[suit];
            if(!s) throw new Error('Invalid suit! Supported suits are: CLUB,DIAMOND,HEART,SPADE. You can also use the first letter as well.');
        }else
            s=suit;
        this.suit=s;
        if(value<2 || value>14) throw new Error('Invalid card value, should be 2 to 14 where 11=J, 12=Q, 13=K and 14=A');
        this.value=value;
    }
    
    toString() {
        return `${this.value}${this.suit[0].toLowerCase()}`
    }
}