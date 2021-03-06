import { cloneDeep } from "lodash";
import "./styles.css";

const lots = [
  {
    createdAt: "2022-02-24T16:00:55.186Z",
    quantity: 5,
    name: "lot1",
    dlc: "02/02/2022"
    // dlc: 1672012800000
  },
  {
    createdAt: "2022-02-23T16:05:00.342Z",
    quantity: 6,
    name: "lot2",
    dlc: "26/12/2022"
  },
  {
    createdAt: "2022-01-24T16:08:10.812Z",
    // quantity: 0,
    quantity: 13,
    name: "lot4",
    dlc: "26/12/2022"
  },
  {
    createdAt: "2021-02-24T15:43:53.380Z",
    quantity: 4,
    name: "lot3",
    dlc: "06/05/2022"
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
      // if (lot.quantity >= quantity) {

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
      console.log("last updated line", lot);
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

const result = decrementLotsQuantity(sortedLots, 18);
console.table("output", result);

export default function App() {
  return (
    <div className="App">
      <h1>See the result in the browser console below</h1>
      <div>
        <h4>User Story</h4>
        En tant que responsble de l'entrep??t, je souhaite que mon stock
        d'ambiants soit d??cr??ment?? en fonction des dispatchs que j'effectue.
        <h4>Contexte</h4>
        Actuellement, on a du stock de produits ambiants
        (yaourts/snack/boissons) entrant dans l'inventaire via les r??ceptions,
        mais on n'a pas de stock sortant sur KFC. Le but de ce ticket est de
        retranscrire le dispatch effectu?? sur les niveaux de stock.
        <h4>Solution</h4>
        Lors du dispatch d'un produit ambiant (subcontractorProducts avec le
        type yaourt, snack ou drink), il faut rep??rer le(s) lot(s) qui sont :
        Associ??s au produit dispatch??s (on a le lien suivant lot \>
        orderSupplierItem \> supplierItem \> subconctractorProduct) De m??me DLC
        que le produit dispatch?? Sur le site choisi par l'utilisateur ?? l'entr??e
        du dispatch Lors du dispatch, il va falloir "d??cr??menter" le stock de
        ce(s) lot(s) (en prenant les lots par ordre chronologique de cr??ation si
        il y en a plusieurs) A chaque fois que je confirme la valeur dispatch??e
        sur 1 hub (voir photo ci-dessous), il faut d??cr??menter le stock de la
        valeur indiqu??e par l'utilisateur. Cette valeur indiqu??e ??tant
        directement en unit?? de stock, on peut d??cr??menter la valeur directement
        ?? la "quantity" du lot qui est aussi en unit?? de stock. D??s que le stock
        est ?? 0 sur mon lot : soit il existe un autre lot de m??me DLC (qui a ??t??
        cr????) --\> on commence ?? d??cr??menter ce lot l?? de la m??me fa??on soit il
        n'existe pas d'autre lot avec la m??me DLC --\> on continue le dispatch
        mais on ne d??cr??mente plus le stock Il faut aussi logguer chaque
        d??cr??mentation dans l'objet events du lot. Sur cet events, on souhaite
        avoir le stock qui est d??cr??ment?? ainsi que le hub de destination
        notamment.
        <h5>Exemple concret</h5>
        Situation initiale Sur le site de Sucy, je souhaite dispatch?? un
        SubcontractorProduct ambiant (yaourt/snack/boisson). Les Lots rattach??s
        ?? ce produit ambiants ont "Pack 6 Pi??ces" comme unit?? de stock
        <b>J'ai 3 lots :</b>
        <ul>
          <li>Lot 1 : DLC au 13/04/2022 et quantit?? = 5 "Pack 6 Pi??ces"</li>
          <li>Lot 2 avec DLC au 13/04/2022 et quantit?? = 6 "Pack 6 Pi??ces"</li>
          <li>Lot 3 avec DLC au 23/05/2022 et quantit?? = 4 "Pack 6 Pi??ces"</li>
        </ul>
        <p>
          A noter : le Lot 1 a ??t?? cr???? avant le Lot 2
          <br />
          En ajoutant le produit concern?? au dispatch (d??velopp?? via des tickets
          pr??c??dents), on a 2 productDispatchs qui sont ajout??s :
          <br />
          un avec la DLC au 13/04/2022 : quantit?? totale disponible = qt?? Lot 1
          + qt?? Lot 2 = 11 "Pack 6 Pi??ces"
          <br />
          un avec la DLC au 23/05/2022 : quantit?? totale disponible = qt?? Lot 3
          = 4 "Pack 6 Pi??ces"
          <br />
        </p>
        <b>Dispatch DLC du 13/04/2022 </b>
        <span>Je dispatch le productDispatch avec DLC au 13/04/2022. </span>
        <p>
          A chaque fois que je confirme le dispatch d'une quantit?? sur un hub,
          on d??cr??mente le stock :
          <br />
          Hub A : dispatch de 2 "Pack 6 Pi??ces"
          <br />
          Je d??cr??mente mon Lot 1 (le plus ancien), le stock restant est = 5 - 2
          = 3 "Pack 6 Pi??ces"
          <br />
          Hub B : dispatch de 2 "Pack 6 Pi??ces"
          <br />
          Je d??cr??mente mon Lot 1 (le plus ancien), le stock restant est = 3 - 2
          = 1 "Pack 6 Pi??ces"
          <br />
          Hub C : dispatch de 3 "Pack 6 Pi??ces"
          <br />
          <br />
          Je d??cr??mente mon Lot 1 (le plus ancien), mais le stock restant (1
          "Pack 6 Pi??ces") n'est pas suffisant ==\> On d??cr??mente aussi le Lot 2
          <br />
          Lot 1 : je d??cr??mente 1 "Pack 6 Pi??ces", donc le stock restant = 0
          <br />
          Lot 2 : je d??cr??mente 2 "Pack 6 Pi??ces" (car 3 Pack dispatch??s et 1
          d??j?? d??cr??ment?? sur le Lot 1), donc le stock restant sur mon lot est =
          6 - 2 = 4 "Pack 6 Pi??ces"
          <br />
          Hub D : dispatch de 5 "Pack 6 Pi??ces"
          <br />
          Le Lot 1 (le plus ancien) ??tant vide, je decr??mente le Lot 2
          <br />
          Stock restant sur le Lot 2 = 4 "Pack 6 Pi??ces", donc je d??cr??mente ces
          4 Packs, et le stock restant est = 0
          <br />
          Pas d'autre lot avec DLC au 13/04/2022 sur lequel d??cr??menter le 1
          "Pack 6 Pi??ces" dispatch?? restant (il ne faut pas d??cr??menter le Lot 3
          car il n'a pas la m??me DLC)
        </p>
      </div>
    </div>
  );
}
