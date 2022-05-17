import { cloneDeep } from "lodash";
import "./styles.css";

const lots = [
  {
    createdAt: "2022-02-24T16:00:55.186Z",
    quantity: 5,
    name: "lot1"
  },
  {
    createdAt: "2022-02-23T16:05:00.342Z",
    quantity: 6,
    name: "lot2"
  },
  {
    createdAt: "2022-01-24T16:08:10.812Z",
    // quantity: 0,
    quantity: 13,
    name: "lot3"
  },
  {
    createdAt: "2021-02-24T15:43:53.380Z",
    quantity: 4,
    name: "lot4"
  }
];

// sort lots by date creation
const sortedLots = lots.sort(
  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
);

/**
 * decrement lots quantity
 * if the current decremented lot is equal to 0, decrement the next lot
 */
const decrementLotsQuantity = (lots, volume) => {
  let quantity = volume;
  const lotsCopy = cloneDeep(lots);

  for (let [index, lot] of lotsCopy.entries()) {
    if (lot.quantity >= quantity) {
      lotsCopy[index].quantity = lotsCopy[index].quantity - quantity;
      quantity = quantity - lotsCopy[index].quantity;

      // lot.quantity = lot.quantity - quantity;
      // quantity = quantity - lot.quantity;

      const newLot = { name: lotsCopy[index].name + "Mod" };
      lotsCopy[index] = {
        ...lotsCopy[index],
        ...newLot
      };

      // this lot should be updated in the database
      console.log("updated to decremented", lot);
      break;
    } else {
      quantity = quantity - lot.quantity;
      lot.quantity = 0;

      if (lots[index].quantity !== lot.quantity) {
        const newLot = { name: lotsCopy[index].name + "Mod" };
        // this lot should be updated in the database
        lotsCopy[index] = {
          ...lotsCopy[index],
          ...newLot
        };
        console.log("updated to 0", lot);
      }
    }
  }
  return lotsCopy;
};

console.table("input", sortedLots);
// console.log('input', sortedLots.map(m => m.quantity))

const result = decrementLotsQuantity(sortedLots, 20);
console.table("output", result);

export default function App() {
  return (
    <div className="App">
      <h1>See the result in the browser console below</h1>
      <div>
        <h4>User Story</h4>
        En tant que responsble de l'entrepôt, je souhaite que mon stock
        d'ambiants soit décrémenté en fonction des dispatchs que j'effectue.
        <h4>Contexte</h4>
        Actuellement, on a du stock de produits ambiants
        (yaourts/snack/boissons) entrant dans l'inventaire via les réceptions,
        mais on n'a pas de stock sortant sur KFC. Le but de ce ticket est de
        retranscrire le dispatch effectué sur les niveaux de stock.
        <h4>Solution</h4>
        Lors du dispatch d'un produit ambiant (subcontractorProducts avec le
        type yaourt, snack ou drink), il faut repérer le(s) lot(s) qui sont :
        Associés au produit dispatchés (on a le lien suivant lot \>
        orderSupplierItem \> supplierItem \> subconctractorProduct) De même DLC
        que le produit dispatché Sur le site choisi par l'utilisateur à l'entrée
        du dispatch Lors du dispatch, il va falloir "décrémenter" le stock de
        ce(s) lot(s) (en prenant les lots par ordre chronologique de création si
        il y en a plusieurs) A chaque fois que je confirme la valeur dispatchée
        sur 1 hub (voir photo ci-dessous), il faut décrémenter le stock de la
        valeur indiquée par l'utilisateur. Cette valeur indiquée étant
        directement en unité de stock, on peut décrémenter la valeur directement
        à la "quantity" du lot qui est aussi en unité de stock. Dès que le stock
        est à 0 sur mon lot : soit il existe un autre lot de même DLC (qui a été
        créé) --\> on commence à décrémenter ce lot là de la même façon soit il
        n'existe pas d'autre lot avec la même DLC --\> on continue le dispatch
        mais on ne décrémente plus le stock Il faut aussi logguer chaque
        décrémentation dans l'objet events du lot. Sur cet events, on souhaite
        avoir le stock qui est décrémenté ainsi que le hub de destination
        notamment.
        <h5>Exemple concret</h5>
        Situation initiale Sur le site de Sucy, je souhaite dispatché un
        SubcontractorProduct ambiant (yaourt/snack/boisson). Les Lots rattachés
        à ce produit ambiants ont "Pack 6 Pièces" comme unité de stock
        <b>J'ai 3 lots :</b>
        <ul>
          <li>Lot 1 : DLC au 13/04/2022 et quantité = 5 "Pack 6 Pièces"</li>
          <li>Lot 2 avec DLC au 13/04/2022 et quantité = 6 "Pack 6 Pièces"</li>
          <li>Lot 3 avec DLC au 23/05/2022 et quantité = 4 "Pack 6 Pièces"</li>
        </ul>
        <p>
          A noter : le Lot 1 a été créé avant le Lot 2
          <br />
          En ajoutant le produit concerné au dispatch (développé via des tickets
          précédents), on a 2 productDispatchs qui sont ajoutés :
          <br />
          un avec la DLC au 13/04/2022 : quantité totale disponible = qté Lot 1
          + qté Lot 2 = 11 "Pack 6 Pièces"
          <br />
          un avec la DLC au 23/05/2022 : quantité totale disponible = qté Lot 3
          = 4 "Pack 6 Pièces"
          <br />
        </p>
        <b>Dispatch DLC du 13/04/2022 </b>
        <span>Je dispatch le productDispatch avec DLC au 13/04/2022. </span>
        <p>
          A chaque fois que je confirme le dispatch d'une quantité sur un hub,
          on décrémente le stock :
          <br />
          Hub A : dispatch de 2 "Pack 6 Pièces"
          <br />
          Je décrémente mon Lot 1 (le plus ancien), le stock restant est = 5 - 2
          = 3 "Pack 6 Pièces"
          <br />
          Hub B : dispatch de 2 "Pack 6 Pièces"
          <br />
          Je décrémente mon Lot 1 (le plus ancien), le stock restant est = 3 - 2
          = 1 "Pack 6 Pièces"
          <br />
          Hub C : dispatch de 3 "Pack 6 Pièces"
          <br />
          <br />
          Je décrémente mon Lot 1 (le plus ancien), mais le stock restant (1
          "Pack 6 Pièces") n'est pas suffisant ==\> On décrémente aussi le Lot 2
          <br />
          Lot 1 : je décrémente 1 "Pack 6 Pièces", donc le stock restant = 0
          <br />
          Lot 2 : je décrémente 2 "Pack 6 Pièces" (car 3 Pack dispatchés et 1
          déjà décrémenté sur le Lot 1), donc le stock restant sur mon lot est =
          6 - 2 = 4 "Pack 6 Pièces"
          <br />
          Hub D : dispatch de 5 "Pack 6 Pièces"
          <br />
          Le Lot 1 (le plus ancien) étant vide, je decrémente le Lot 2
          <br />
          Stock restant sur le Lot 2 = 4 "Pack 6 Pièces", donc je décrémente ces
          4 Packs, et le stock restant est = 0
          <br />
          Pas d'autre lot avec DLC au 13/04/2022 sur lequel décrémenter le 1
          "Pack 6 Pièces" dispatché restant (il ne faut pas décrémenter le Lot 3
          car il n'a pas la même DLC)
        </p>
      </div>
    </div>
  );
}
