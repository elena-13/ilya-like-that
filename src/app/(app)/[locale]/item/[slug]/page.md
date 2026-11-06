# Item Page

Layout spec / content mockup for `src/app/item/[slug]/page.tsx`.

---

## Item Image

![{item.name}]({item.image})

> Source field: `item.image` (e.g. `/images/item-1.jpg`)
> Alt text: `item.name`

---

## Details

# {item.name}

**Brand:** {item.brand}

[View in the shop ↗]({item.link})  ← quiet pill under the title, only when there is a link

---

## Status Block — Reservation Info

### When available (`item.isBooked === false`)

> 🟢 **Available**
>
> This gift hasn't been reserved yet. Book it to let others know it's taken.

### When booked (`item.isBooked === true`)

> 🔴 **Reserved**
>
> Booked by **{item.bookedBy}**.
> No one else can reserve this gift while it's booked.

---

## Buttons

One row at the bottom right, under the status block. **My gifts** is always
first; the action for this gift sits last.

| State                       | Buttons                        |
| --------------------------- | ------------------------------ |
| Available                   | **My gifts**, **Book**         |
| Booked by you               | **My gifts**, **Cancel booking** |
| Booked by someone else      | **My gifts**                   |

```
                                   [ My gifts ] [ Book ]
                         [ My gifts ] [ Cancel booking ]
```

---

## Data fields

| Field        | Type             | Notes                          |
| ------------ | ---------------- | ------------------------------ |
| `name`       | string           | Item title (`<h1>`)            |
| `brand`      | string           | Brand label                    |
| `image`      | string           | Public path to image           |
| `link`       | string           | External product URL           |
| `isBooked`   | boolean          | Drives status block + button   |
| `bookedBy`   | string \| null   | Reserver's name when booked    |
