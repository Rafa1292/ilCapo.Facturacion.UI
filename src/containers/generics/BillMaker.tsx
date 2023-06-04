import React, { useContext, useEffect, useState } from 'react'
import '../../scss/billMaker.scss'
import { SaleItemCategory } from '../../types/saleItemCategory'
import { useGetList, useGet, usePost, usePatch } from '../../hooks/useAPI'
import { ProductModifier } from '../../types/productModifier'
import BillMakerItems from '../../components/billMaker/BillMakerItems'
import useBill from '../../hooks/useBill'
import BillResume from '../../components/BillResume'
import CustomInputSelect from '../../components/generics/CustomInputSelect'
import { BillItemLinkedProduct } from '../../types/billItemLinkedProduct'
import { BillItem } from '../../types/billItem'
import Swal from 'sweetalert2'
import AppContext from '../../context/AppContext'
import { BillFunctions } from '../../types/billFunctions'
import BillPayMethod from '../../components/BillPayMethod'
import { LinkedProduct } from '../../types/linkedProduct'

interface Props {
  billFunctions: BillFunctions
  close: () => void
}

interface SearchProduct {
  id: number
  categoryId: number
  saleItemId: number
  name: string
}

const initialSearchProduct: SearchProduct = {
  id: 0,
  categoryId: 0,
  saleItemId: 0,
  name: ''
}

const initialBillItem: BillItem = {
  id: 0,
  quantity: 1,
  billId: 0,
  saleItemId: 0,
  billProducts: [],
  delete: false,
  description: '',
  discount: 0,
  kitchenMessage: false,
  tax: 0,
  unitPrice: 0,
  createdBy: 0,
  updatedBy: 0
}

const BillMaker = ({ billFunctions, close }: Props) => {
  const [saleItemCategories, setSaleItemCategories] = useState<SaleItemCategory[]>([])
  const [saleItemCategory, setSaleItemCategory] = useState<SaleItemCategory>()
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([])
  const [editBillItem, setEditBillItem] = useState<BillItem>({ saleItemId: 0 } as BillItem)
  const { user } = useContext(AppContext)
  const { bill, fastPayAction, closeBill, addBillItem, printBill, removeLinkedProduct, addAccountHistory, removeAccountHistory, editLinkedProduct, getClient, getBill, removeCombinedLinkedProduct } = billFunctions
  const [showPayMethods, setShowPayMethods] = useState(false)
  const [pullApartBill, setPullApartBill] = useState<boolean>(false)
  const nextBillFunctions = useBill(0)

  const handleChange = (event: any) => {
    const { value } = event.target
    const tmpSearchProduct = searchProducts.find(searchProduct => searchProduct.saleItemId === value)
    if (tmpSearchProduct) {
      const tmpSaleItemCategory = saleItemCategories.find(saleItemCategory => saleItemCategory.id === tmpSearchProduct.categoryId)
      if (tmpSaleItemCategory) {
        setSaleItemCategory(tmpSaleItemCategory)
        const tmpSaleItem = tmpSaleItemCategory.saleItems.find(saleItem => saleItem.id === tmpSearchProduct.saleItemId)
        if (tmpSaleItem) {
          setEditBillItem({ ...initialBillItem, saleItemId: tmpSaleItem.id })
        }
      }
    }
  }

  const setCategory = (saleItemCategory: SaleItemCategory) => {
    setEditBillItem({ saleItemId: 0 } as BillItem)
    setSaleItemCategory(saleItemCategory)
  }

  const initializeSearchProducts = (saleItemCategories: SaleItemCategory[]) => {
    const tmpSearchProducts: SearchProduct[] = []
    for (const saleItemCategory of saleItemCategories) {
      for (const saleItem of saleItemCategory.saleItems) {
        const tmpSearchProduct: SearchProduct = {
          id: 0,
          categoryId: saleItemCategory.id,
          saleItemId: saleItem.id,
          name: saleItem.name
        }
        tmpSearchProducts.push(tmpSearchProduct)
      }
    }
    setSearchProducts(tmpSearchProducts)
  }

  const handleEditLinkedProduct = (saleItemId: number, itemNumber: number) => {
    const tmpBillItem = editLinkedProduct(saleItemId, itemNumber)
    if (tmpBillItem) {
      for (const category of saleItemCategories) {
        const tmpSaleItem = category.saleItems.find(saleItem => saleItem.id === tmpBillItem.saleItemId)
        if (tmpSaleItem) {
          setSaleItemCategory(category)
          break
        }
      }
      setEditBillItem(tmpBillItem)
    }
  }

  const commandBill = async () => {
    bill.workDayUserId = user.workDayUser.id
    if (validateBill()) {
      if (bill.id === 0) {
        await newBill()
      }
      else {
        await updateBill()
      }
    }
  }

  const newBill = async () => {
    const response = await usePost('bills', bill, true)
    if (!response.error) {
      console.log('commandBill')
      getBill()
    }
  }

  const updateBill = async () => {
    console.log(bill)
    const response = await usePatch('bills', bill, true)
    if (!response.error) {
      console.log('updateBill')
      getBill()
    }
  }


  const validateBill = (): boolean => {
    if ((!bill.isCommanded))
      return true
    let valid = false
    for (const billItem of bill.items) {
      for (const billItemLinkedProduct of billItem.billProducts) {
        for (const linkedProduct of billItemLinkedProduct.products) {
          if (!linkedProduct.isCommanded)
            valid = true
        }
      }
    }

    if (!valid) {
      Swal.fire('Error', 'No hay productos nuevos para comandar', 'error')
    } else {
      if (bill.clientId === 0) {
        valid = false
        Swal.fire('Error', 'Debe asignar un cliente', 'error')
      }
    }

    return valid
  }

  const moveBillItem = (billItemLinkedProductId: number, saleItemId: number, itemNumber: number) => {
    for (const billItem of bill.items) {
      if (billItem.saleItemId === saleItemId) {
        const tmpBillProducts: BillItemLinkedProduct[] = []
        for (const billProduct of billItem.billProducts) {
          if (billProduct.itemNumber === itemNumber) {
            tmpBillProducts.push({ ...billProduct, itemNumber: 1 })
          }
        }
        const tmpBillItemId = billItem.quantity === 1 ? billItem.id : 0
        nextBillFunctions.addBillItem({ ...billItem, billProducts: tmpBillProducts, quantity: 1, id: tmpBillItemId } as BillItem)
        removeLinkedProduct(saleItemId, itemNumber, billItemLinkedProductId)
      }
    }
  }

  const moveBillItemBack = (billItemLinkedProductId: number, saleItemId: number, itemNumber: number) => {
    for (const billItem of nextBillFunctions.bill.items) {
      if (billItem.saleItemId === saleItemId) {
        const tmpBillProducts: BillItemLinkedProduct[] = []
        for (const billProduct of billItem.billProducts) {
          if (billProduct.itemNumber === itemNumber) {
            tmpBillProducts.push({ ...billProduct, itemNumber: 1 })
          }
        }
        addBillItem({ ...billItem, billProducts: tmpBillProducts, quantity: 1 } as BillItem)
        nextBillFunctions.removeLinkedProduct(saleItemId, itemNumber, billItemLinkedProductId)
      }
    }
  }

  useEffect(() => {
    const getSaleItemCategories = async () => {
      const response = await useGetList<SaleItemCategory[]>('saleItemCategories', false)
      if (!response.error) {
        const tmpSaleItemCategories = response.data
        initializeSearchProducts(saleItemCategories)
        for (const saleItemCategory of tmpSaleItemCategories) {
          for (const saleItem of saleItemCategory.saleItems) {
            for (const saleItemProduct of saleItem.saleItemProducts) {
              const productModifiersResponse = await useGet<ProductModifier[]>(`productModifiers/byProductId/${saleItemProduct.productId}`, false)
              if (!productModifiersResponse.error) {
                const productModifiers = productModifiersResponse.data
                saleItemProduct.product.productModifiers = productModifiers
              }
            }
          }
        }
        setSaleItemCategories(tmpSaleItemCategories)
      }
    }
    getSaleItemCategories()
    getBill()
  }, [])


  return (
    <div className='col-12 d-flex flex-wrap'>
      <button className="btn btn-warning position-absolute" style={{ top: '0', right: '0vw', zIndex: '1000' }} onClick={() => nextBillFunctions.printBill()}>Imprimir</button>
      <button className="btn btn-warning position-absolute" style={{ top: '0', right: '6vw', zIndex: '1000' }} onClick={() => printBill()}>Imprimir orig</button>
      {
        showPayMethods
        &&
        <div className="col-8 d-flex justify-content-center flex-wrap scroll" style={{ maxHeight: '100vh', alignContent: 'baseline', overflowY: 'scroll' }}>
          <BillPayMethod close={close} moveBillItemBack={moveBillItemBack} nextBillFunctions={nextBillFunctions}
            setPullApartBill={setPullApartBill} pullApartBill={pullApartBill} closeBill={closeBill}
            fastPayAction={fastPayAction} removeAccountHistory={removeAccountHistory} bill={bill} addAccountHistory={addAccountHistory} />
        </div>
        ||
        <div className="col-8 bill-maker" >
          <div className="col-12 d-flex flex-wrap justify-content-end p-2">
            <div className="col-6">
              <CustomInputSelect showLabel={false} value={editBillItem?.saleItemId}
                customInputSelect={
                  {
                    label: 'Productos', name: 'id',
                    handleChange: handleChange, pattern: '', validationMessage: ''
                  }}
                data={searchProducts.map(searchProduct => { return { value: searchProduct.saleItemId, label: searchProduct.name } })}
                defaultLegend={'Productos'}
              />
            </div>
          </div>
          <div className="col-8 d-flex flex-wrap justify-content-around position-absolute bg-dark p-2 shadow"
            style={{ borderBottom: '1px solid rgba(255,193,7,0.8)', top: '0' }}>
            {
              saleItemCategories.map((tmpSaleItemCategory, index) => {
                return (
                  <div key={index} onClick={() => setCategory(tmpSaleItemCategory)} className="px-3 py-1 rounded pointer item-category" >
                    <h6 className='m-0'>{tmpSaleItemCategory.name}</h6>
                  </div>
                )
              })
            }
          </div>
          {
            saleItemCategory &&
            <BillMakerItems editBilItem={editBillItem ? editBillItem : { saleItemId: 0 } as BillItem} addBillItem={addBillItem} saleItemCategory={saleItemCategory} />
          }
        </div>
      }
      <div className="col-4 shadow bill-resume position-relative" style={{ height: '100vh', zIndex: '100' }}>
        <BillResume moveBillItem={moveBillItem} pullApartBill={pullApartBill} showPayMethods={() => setShowPayMethods(!showPayMethods)} removeCombinedLinkedProduct={removeCombinedLinkedProduct} getClient={getClient} commandBill={commandBill} handleEditLinkedProduct={handleEditLinkedProduct} removeLinkedProduct={removeLinkedProduct} bill={bill} />
      </div>
    </div>
    ||
    <></>
  )
}

export default BillMaker