import React, { useEffect, useState } from 'react'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { SaleItem } from '../../types/saleItem'
import BillMakerProducts from './BillMakerProducts'
import { BillItem } from '../../types/billItem'
import { BillItemLinkedProduct } from '../../types/billItemLinkedProduct'
import { LinkedProduct } from '../../types/linkedProduct'
import { SaleItemProduct } from '../../types/saleItemProduct'
import { Product } from '../../types/product'
import { LinkedProductModifier } from '../../types/linkedProductModifier'
import { LinkedProductModifierElement } from '../../types/linkedProductModifierElement'
import { ModifierElement } from '../../types/modifierElement'

interface Props {
  saleItemCategory: SaleItemCategory
  addBillItem: (billItem: BillItem) => void
}

const initialBillItem: BillItem = {
  id: 0,
  quantity: 1,
  billId: 0,
  saleItemId: 0,
  billItemLinkedProducts: [],
  delete: false,
  description: '',
  discount: 0,
  kitchenMessage: false,
  tax: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialBillItemLinkedProduct: BillItemLinkedProduct = {
  id: 0,
  billItemId: 0,
  delete: false,
  itemNumber: 0,
  combined: false,
  linkedProducts: [],
  createdBy: 0,
  updatedBy: 0
}

const initialLinkedProduct: LinkedProduct = {
  id: 0,
  billItemLinkedProductId: 0,
  delete: false,
  linkedProductModifiers: [],
  name: '',
  productId: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const initialLinkedProductModifierElement: LinkedProductModifierElement = {
  id: 0,
  linkedProductModifierId: 0,
  delete: false,
  price: 0,
  name: '',
  modifierElementId: 0,
  createdBy: 0,
  updatedBy: 0
}

const BillMakerItems = ({ saleItemCategory, addBillItem }: Props) => {
  const [saleItem, setSaleItem] = useState<SaleItem>()
  const [billItem, setBillItem] = useState<BillItem>(initialBillItem)

  const newBillItem = (saleItem: SaleItem) => {
    setSaleItem(saleItem)
    const currentBillItem = {
      ...initialBillItem,
      saleItemId: saleItem.id,
      unitPrice: saleItem.price,
      description: saleItem.name,
      billItemLinkedProducts: newBillItemLinkedProduct(saleItem)
    }
    setBillItem(currentBillItem)
  }

  const newBillItemLinkedProduct = (saleItem: SaleItem): BillItemLinkedProduct[] => {
    const billItemLinkedProducts: BillItemLinkedProduct[] = []
    saleItem.saleItemProducts.map((saleItemProduct, index) => {
      const billItemLinkedProduct = {
        ...initialBillItemLinkedProduct,
        id: saleItem.id,
        itemNumber: 1,
        linkedProducts: [newLinkedProduct(saleItemProduct)]
      }
      billItemLinkedProducts.push(billItemLinkedProduct)
    })
    return billItemLinkedProducts
  }

  const newLinkedProduct = (saleItemProduct: SaleItemProduct): LinkedProduct => {
    const linkedProduct = {
      ...initialLinkedProduct,
      id: billItem.billItemLinkedProducts.length + 1,
      productId: saleItemProduct.product.id,
      unitPrice: saleItemProduct.product.price,
      name: saleItemProduct.product.name,
      linkedProductModifiers: newLinkedProductModifiers(saleItemProduct.product)
    }
    return linkedProduct
  }

  const newLinkedProductModifiers = (product: Product): LinkedProductModifier[] => {
    const linkedProductModifiers: LinkedProductModifier[] = []
    product.productModifiers.map((productModifier, index) => {
      const linkedProductModifier: LinkedProductModifier = {
        id: 0,
        linkedProductId: 0,
        delete: false,
        modifierGroupId: productModifier.modifierGroup.id,
        linkedProductModifierElements: [],
        label: productModifier.modifierGroup.label,
        maxSelectable: productModifier.modifierGroup.maxSelectable,
        minSelectable: productModifier.modifierGroup.minSelectable,
        name: productModifier.modifierGroup.name,
        quantity: 1,
        createdBy: 0,
        updatedBy: 0
      }
      linkedProductModifiers.push(linkedProductModifier)
    })
    return linkedProductModifiers
  }

  const newLinkedProductModifierElement = (modifierElement: ModifierElement) => {
    const newLinkedProductModifierElement: LinkedProductModifierElement = {
      ...initialLinkedProductModifierElement,
      modifierElementId: modifierElement.id,
      name: modifierElement.name,
      price: modifierElement.price
    }
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const productModifier of linkedProduct.linkedProductModifiers) {
          if (productModifier.modifierGroupId === modifierElement.modifierGroupId) {
            productModifier.linkedProductModifierElements.push(newLinkedProductModifierElement)
          }
        }
      }
    }
  }

  const newCombinedLinkedProduct = (itemNumber: number, linkedProduct: LinkedProduct, billItemLinkedProductId: number) => {
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      if (billItemLinkedProduct.itemNumber === itemNumber && billItemLinkedProduct.id === billItemLinkedProductId) {
        const tmpLinkedProducts = billItemLinkedProduct.linkedProducts.filter((linkedProduct) => linkedProduct.id !== 0)
        tmpLinkedProducts.push(linkedProduct)
        billItemLinkedProduct.linkedProducts = tmpLinkedProducts
      }
    }
  }

  const removeLinkedProductModifierElement = (modifierElement: ModifierElement) => {
    for (const billItemLinkedProduct of billItem.billItemLinkedProducts) {
      for (const linkedProduct of billItemLinkedProduct.linkedProducts) {
        for (const productModifier of linkedProduct.linkedProductModifiers) {
          if (productModifier.modifierGroupId === modifierElement.modifierGroupId) {
            productModifier.linkedProductModifierElements = productModifier.linkedProductModifierElements.filter((linkedProductModifierElement) => linkedProductModifierElement.modifierElementId !== modifierElement.id)
          }
        }
      }
    }
  }

  const setNewBillItem = () => {
    setBillItem(initialBillItem)
  }


  useEffect(() => {
    setSaleItem(undefined)
  }, [saleItemCategory])

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => console.log(billItem)} >Print item</button>
      <div className="col-12 d-flex flex-wrap justify-content-center">
        {
          saleItem === undefined &&
          saleItemCategory?.saleItems.map((tmpSaleItem, index) => {
            return (
              <div key={index} className="col-3 p-2 pointer" onClick={() => newBillItem(tmpSaleItem)}>
                <div className="card shadow">
                  <div className="card-body">
                    <h5 className="card-title">{tmpSaleItem.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{tmpSaleItem.description}</h6>
                    <p className="card-text">{tmpSaleItem.price}</p>
                  </div>
                </div>
              </div>
            )
          })
        }
        {
          saleItem &&
          <BillMakerProducts setSaleItem={setSaleItem} newCombinedLinkedProduct={newCombinedLinkedProduct} setNewBillItem={setNewBillItem} removeLinkedProductModifierElement={removeLinkedProductModifierElement} addLinkedProductModifierElement={newLinkedProductModifierElement} addBillItem={addBillItem} billItem={billItem} saleItem={saleItem} />
        }
      </div>
    </>
  )
}

export default BillMakerItems