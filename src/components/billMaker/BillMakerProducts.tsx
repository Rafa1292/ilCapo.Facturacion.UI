import React, { useContext, useEffect, useState } from 'react'
import '../../scss/billMakerProducts.scss'
import { SaleItem } from '../../types/saleItem'
import { Product } from '../../types/product'
import BillMakerModifierGroups from './BillMakerModifierGroups'
import { BillItem } from '../../types/billItem'
import { ModifierElement } from '../../types/modifierElement'
import { LinkedProduct } from '../../types/linkedProduct'
import AppContext from '../../context/AppContext'
import Swal from 'sweetalert2'

interface Props {
  billId: number
  saleItem: SaleItem
  billItem: BillItem
  tableNumber: number
  setSaleItem: (saleItem: SaleItem | undefined) => void
  addLinkedProductModifierElement: (
    modifierElement: ModifierElement,
    saleItemProductId: number
  ) => void
  removeLinkedProductModifierElement: (
    modifierElement: ModifierElement,
    saleItemProductId: number
  ) => void
  setNewBillItem: () => void
  newCombinedLinkedProduct: (
    linkedProduct: LinkedProduct,
    billItemLinkedProductId: number
  ) => void
}

const BillMakerProducts = ({
  saleItem,
  tableNumber,
  setSaleItem,
  billItem,
  billId,
  newCombinedLinkedProduct,
  setNewBillItem,
  addLinkedProductModifierElement,
  removeLinkedProductModifierElement,
}: Props) => {
  const [product, setProduct] = useState<Product>()
  const [incompleteProducts, setIncompleteProducts] = useState<number[]>([])
  const [validate, setValidate] = useState<boolean>(false)
  const [saleItemProductId, setSaleItemProductId] = useState<number>(0)
  const { billFunctions } = useContext(AppContext)

  const addNewBillItem = () => {
    if (validateBillItem()) {
      billFunctions.addBillItem(billItem, billId, tableNumber)
      console.log('agregando item a factura', billItem.billId, tableNumber)
      setNewBillItem()
      setSaleItem(undefined)
    }
  }

  const validateBillItem = (): boolean => {
    let isValid = true
    setValidate(true)
    const tmpIncompleteProducts: number[] = []
    for (const billItemLinkedProduct of billItem.billProducts) {
      for (const linkedProduct of billItemLinkedProduct.products) {
        for (const productModifier of linkedProduct.modifiers) {
          const elementsQuantity = productModifier.elements.length
          if (
            elementsQuantity < productModifier.minSelectable ||
            elementsQuantity > productModifier.maxSelectable
          ) {
            Swal.fire({
              position: 'top-end',
              toast: true,
              background: '#7F270C',
              color: 'white',
              title: `Producto incompleto ${productModifier.name} es necesario`,
              showConfirmButton: false,
              timer: 2000,
              heightAuto: false,
            })
            console.log('Producto incompleto', billItemLinkedProduct.id)
            tmpIncompleteProducts.push(billItemLinkedProduct.id)
            isValid = false
          }
        }
      }
    }
    setIncompleteProducts(tmpIncompleteProducts)
    return isValid
  }

  const addProduct = (product: Product, saleItemProductId: number) => {
    setProduct(product)
    setSaleItemProductId(saleItemProductId)
  }

  useEffect(() => {
    if (saleItem.saleItemProducts.length > 0) {
      setProduct(saleItem.saleItemProducts[0].product)
      setSaleItemProductId(saleItem.saleItemProducts[0].id)
    }
  }, [saleItem, billItem])

  return (
    <>
      <div
        className='col-12 d-flex justify-content-start align-items-center scroll'
        style={{ height: '80px', overflowX: 'scroll', overflowY: 'hidden' }}
      >
        {saleItem !== undefined &&
          saleItem.saleItemProducts.map((saleItemProduct, index) => {
            return (
              <div
                key={index}
                className='p-2 pointer'
                onClick={() =>
                  addProduct(saleItemProduct.product, saleItemProduct.id)
                }
              >
                <div
                  className='card product_item'
                  style={{
                    height: `${
                      saleItemProduct.id === saleItemProductId ? '75px' : '68px'
                    }`,
                    boxShadow: `0px 0px ${
                      saleItemProduct.id === saleItemProductId
                        ? '5px 2px'
                        : '0px 0px'
                    } rgba(0,0,0,.5)`,
                    border: `${
                      saleItemProduct.id === saleItemProductId ? '2px' : '0'
                    } solid rgba(255, 193, 7)`,
                  }}
                >
                  <div className='card-body d-flex flex-wrap justify-content-center align-items-center'>
                    <span className='card-title text-center'>
                      {saleItemProduct.product.name}
                    </span>
                  </div>
                </div>
                {incompleteProducts.includes(saleItemProduct.id) &&
                  validate && (
                    <div className='col-12 d-flex justify-content-center'>
                      <span className='text-danger'>Producto incompleto</span>
                    </div>
                  )}
              </div>
            )
          })}
      </div>
      {product?.productModifiers !== undefined && product?.productModifiers.length > 0 && (
        <div
          className='col-12 d-flex flex-wrap pt-1 justify-content-end px-2'
          style={{
            borderBottom: '1px solid rgba(0,0,0,.2)',
            color: 'rgba(0,0,0,.5)',
          }}
        >
          Grupos modificadores
        </div>
      )}
      {product && (
        <BillMakerModifierGroups
          saleItemProductId={saleItemProductId}
          newCombinedLinkedProduct={newCombinedLinkedProduct}
          billItem={billItem}
          removeLinkedProductModifierElement={
            removeLinkedProductModifierElement
          }
          addLinkedProductModifierElement={addLinkedProductModifierElement}
          product={product}
        />
      )}

      <div
        className='col-8 position-absolute p-3 shadow bg-light'
        style={{ bottom: '0', left: '0' }}
      >
        <button
          className='btn btn-success col-12 py-4 fs-5'
          onClick={addNewBillItem}
        >
          Agregar
        </button>
      </div>
    </>
  )
}

export default BillMakerProducts
