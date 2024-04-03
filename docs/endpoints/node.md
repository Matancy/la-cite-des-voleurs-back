# Node

## GET

Endpoint to get a node information. 

The **type** define the type of node. Types could be : 
- Choice
- Dice
- Fight
- Direct_link
- End

**text** will contain the text to display on the user screen.

**imageURL** is the description of the node, in an image type.

**links** is an array that is not always given by the api. It contains the cost of the link and the next node to go to.

**action** is an object that is not always given by the api. It contains the field that could be "Chance" or "Habilete" and the success and fail node to go to.

**IdOfNextNode** is the next node to go to.

**FoeHability** is the hability of the foe.

**FoeStamina** is the stamina of the foe.

### Request :
Url : /nodes/{id}

Params : 
- **id** : Identifier of the page *(integer)*

### Response :
```
{
    id: int,
    type: string,
    text: (html content) string,
    imageURL: URL,
    links: (nullable) 
    [
        {
            cost: int,
            nextNode: int
        }
    ],
    action:  (nullable)
    {
        field: string,
        success: int,
        fail: int
    },
    IdOfNextNode: (nullable) int,
    FoeHability: (nullable) int,
    FoeStamina: (nullable) int
}
```