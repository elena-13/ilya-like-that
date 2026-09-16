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

[View product →]({item.link})

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

| State                | Visible button | Action                              |
| -------------------- | -------------- | ----------------------------------- |
| `isBooked === false` | **Book**       | Reserve the item, set `bookedBy`    |
| `isBooked === true`  | **Unbook**     | Cancel reservation, clear `bookedBy`|

```
[ Book ]      ← shown when item is available
[ Unbook ]    ← shown when item is already reserved
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
